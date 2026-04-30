// Copyright (C) 2017-2023 Smart code 203358507

const EventEmitter = require('eventemitter3');
const Bridge = require('@stremio/stremio-core-web/bridge');

const BRIDGE_TIMEOUT_MS = 30000;
const HEARTBEAT_INTERVAL_MS = 30000;

function withTimeout(promise, timeoutMs, label) {
    let timer;
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
        }),
    ]).finally(() => clearTimeout(timer));
}

function CoreTransport(args) {
    const events = new EventEmitter();
    const worker = new Worker(`${process.env.COMMIT_HASH}/scripts/worker.js`);
    const bridge = new Bridge(window, worker);
    let dead = false;
    let heartbeatTimer = null;

    const declareDead = (reason) => {
        if (dead) return;
        dead = true;
        if (heartbeatTimer !== null) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
        console.error('CoreTransport: worker considered dead —', reason);
        events.emit('workerDead', reason);
    };

    const call = (path, payload, label) => {
        if (dead) return Promise.reject(new Error('core worker is unavailable'));
        return withTimeout(bridge.call(path, payload), BRIDGE_TIMEOUT_MS, label).catch((err) => {
            if (err && typeof err.message === 'string' && err.message.includes('timed out')) {
                declareDead(err.message);
            }
            throw err;
        });
    };

    worker.addEventListener('error', (e) => declareDead(e.message || 'worker error event'));
    worker.addEventListener('messageerror', () => declareDead('worker messageerror event'));

    window.onCoreEvent = ({ name, args }) => {
        try {
            events.emit(name, args);
        } catch (error) {
            console.error('CoreTransport', error);
        }
    };

    call(['init'], [args], 'init')
        .then(() => {
            try {
                events.emit('init');
            } catch (error) {
                console.error('CoreTransport', error);
            }
        })
        .catch((error) => {
            events.emit('error', error);
        });

    heartbeatTimer = setInterval(() => {
        call(['getState'], ['ctx'], 'heartbeat').catch(() => { /* declareDead already handled */ });
    }, HEARTBEAT_INTERVAL_MS);

    this.on = function(name, listener) {
        events.on(name, listener);
    };
    this.off = function(name, listener) {
        events.off(name, listener);
    };
    this.removeAllListeners = function() {
        events.removeAllListeners();
    };
    this.getState = async function(field) {
        return call(['getState'], [field], `getState(${field})`);
    };
    this.getDebugState = async function() {
        return call(['getDebugState'], [], 'getDebugState');
    };
    this.dispatch = async function(action, field) {
        return call(['dispatch'], [action, field, location.hash], 'dispatch');
    };
    this.analytics = async function(event) {
        return call(['analytics'], [event, location.hash], 'analytics');
    };
    this.decodeStream = async function(stream) {
        return call(['decodeStream'], [stream], 'decodeStream');
    };
    this.encodeStream = async function(stream) {
        return call(['encodeStream'], [stream], 'encodeStream');
    };
}

module.exports = CoreTransport;
