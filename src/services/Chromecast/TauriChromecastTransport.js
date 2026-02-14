// Copyright (C) 2017-2023 Smart code 203358507

const EventEmitter = require('eventemitter3');
const hat = require('hat');

const MESSAGE_NAMESPACE = 'urn:x-cast:com.stremio';
const CHUNK_SIZE = 20000;

const CAST_STATE = {
    NO_DEVICES_AVAILABLE: 'NO_DEVICES_AVAILABLE',
    NOT_CONNECTED: 'NOT_CONNECTED',
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
};

const SESSION_STATE = {
    NO_SESSION: 'NO_SESSION',
    SESSION_STARTING: 'SESSION_STARTING',
    SESSION_STARTED: 'SESSION_STARTED',
    SESSION_START_FAILED: 'SESSION_START_FAILED',
    SESSION_ENDING: 'SESSION_ENDING',
    SESSION_ENDED: 'SESSION_ENDED',
    SESSION_RESUMED: 'SESSION_RESUMED',
};

const CAST_EVENT = {
    CAST_STATE_CHANGED: 'caststatechanged',
    SESSION_STATE_CHANGED: 'sessionstatechanged',
};

function setupCastGlobals() {
    if (typeof window.cast === 'undefined') {
        window.cast = {
            framework: {
                CastState: CAST_STATE,
                CastContextEventType: CAST_EVENT,
                SessionState: SESSION_STATE,
                CastSession: {
                    APPLICATION_STATUS_CHANGED: 'applicationStatusChanged',
                    APPLICATION_METADATA_CHANGED: 'applicationMetadataChanged',
                    ACTIVE_INPUT_STATE_CHANGED: 'activeInputStateChanged',
                    VOLUME_CHANGED: 'volumeChanged',
                    MEDIA_SESSION: 'mediaSession',
                },
            },
        };
    }
    if (typeof window.chrome === 'undefined') {
        window.chrome = {};
    }
    if (!window.chrome.cast) {
        window.chrome.cast = {
            AutoJoinPolicy: { PAGE_SCOPED: 'PAGE_SCOPED' },
        };
    }
}

function invoke(cmd, args) {
    return window.__TAURI_INTERNALS__.invoke(cmd, args || {});
}

function TauriChromecastTransport() {
    setupCastGlobals();

    const events = new EventEmitter();
    const messages = {};

    let castState = CAST_STATE.NOT_CONNECTED;
    let sessionState = SESSION_STATE.NO_SESSION;
    let deviceName = null;
    let receiverAppId = null;

    const onChromecastMessage = (e) => {
        try {
            const { id, chunk, index, length } = e.detail;
            messages[id] = messages[id] || [];
            messages[id][index] = chunk;
            if (Object.keys(messages[id]).length === length) {
                const parsed = JSON.parse(messages[id].join(''));
                delete messages[id];
                events.emit('message', parsed);
            }
        } catch (error) {
            events.emit('message-error', error);
        }
    };

    const onStateChanged = (e) => {
        const prev = { castState, sessionState };
        castState = e.detail.castState || castState;
        sessionState = e.detail.sessionState || sessionState;

        if (prev.castState !== castState) {
            events.emit(CAST_EVENT.CAST_STATE_CHANGED, { castState });
        }
        if (prev.sessionState !== sessionState) {
            events.emit(CAST_EVENT.SESSION_STATE_CHANGED, {
                sessionState,
                session: { getCastDevice: () => ({ friendlyName: deviceName }) },
            });
        }
    };

    window.addEventListener('chromecast:message', onChromecastMessage);
    window.addEventListener('chromecast:state-changed', onStateChanged);

    setTimeout(() => events.emit('init'), 0);

    this.on = function(name, listener) {
        events.on(name, listener);
    };
    this.off = function(name, listener) {
        events.off(name, listener);
    };
    this.removeAllListeners = function() {
        events.removeAllListeners();
        window.removeEventListener('chromecast:message', onChromecastMessage);
        window.removeEventListener('chromecast:state-changed', onStateChanged);
    };
    this.getCastState = function() {
        return castState;
    };
    this.getSessionState = function() {
        return sessionState;
    };
    this.getCastDevice = function() {
        if (castState === CAST_STATE.CONNECTED && deviceName) {
            return { friendlyName: deviceName };
        }
        return null;
    };
    this.setOptions = function(options) {
        if (options && options.receiverApplicationId) {
            receiverAppId = options.receiverApplicationId;
        }
    };
    this.requestSession = function() {
        events.emit('session-request');
        return Promise.resolve();
    };
    this.endCurrentSession = function(stopCasting) {
        if (stopCasting) {
            return invoke('chromecast_disconnect').then(() => {
                castState = CAST_STATE.NOT_CONNECTED;
                sessionState = SESSION_STATE.SESSION_ENDED;
                deviceName = null;
                events.emit(CAST_EVENT.CAST_STATE_CHANGED, { castState });
                events.emit(CAST_EVENT.SESSION_STATE_CHANGED, { sessionState });
            });
        }
    };
    this.sendMessage = function(message) {
        const serialized = JSON.stringify(message);
        const chunksCount = Math.ceil(serialized.length / CHUNK_SIZE);
        const id = hat();
        const promises = [];

        for (let i = 0; i < chunksCount; i++) {
            const start = i * CHUNK_SIZE;
            const chunk = serialized.slice(start, start + CHUNK_SIZE);
            const payload = JSON.stringify({ id, chunk, index: i, length: chunksCount });
            promises.push(invoke('chromecast_send', { message: payload }));
        }

        return Promise.all(promises);
    };

    this.connectAndLaunch = function(host, port, name) {
        deviceName = name;
        castState = CAST_STATE.CONNECTING;
        events.emit(CAST_EVENT.CAST_STATE_CHANGED, { castState });

        return invoke('chromecast_connect', { host, port, name })
            .then(() => invoke('chromecast_launch', { appId: receiverAppId || '1634F54B' }))
            .then(() => {
                castState = CAST_STATE.CONNECTED;
                sessionState = SESSION_STATE.SESSION_STARTED;
                events.emit(CAST_EVENT.CAST_STATE_CHANGED, { castState });
                events.emit(CAST_EVENT.SESSION_STATE_CHANGED, {
                    sessionState,
                    session: { getCastDevice: () => ({ friendlyName: name }) },
                });
            })
            .catch((err) => {
                castState = CAST_STATE.NOT_CONNECTED;
                sessionState = SESSION_STATE.SESSION_START_FAILED;
                deviceName = null;
                events.emit(CAST_EVENT.CAST_STATE_CHANGED, { castState });
                events.emit(CAST_EVENT.SESSION_STATE_CHANGED, { sessionState });
                throw err;
            });
    };

    this.discover = function() {
        return invoke('chromecast_discover');
    };
}

module.exports = TauriChromecastTransport;
