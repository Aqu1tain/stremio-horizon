import Bridge from '@stremio/stremio-core-web/bridge';

const BRIDGE_TIMEOUT_MS = 30000;
const HEARTBEAT_INTERVAL_MS = 30000;

const worker = new Worker(`${process.env.COMMIT_HASH}/scripts/worker.js`);
const bridge = new Bridge(window, worker);

let dead = false;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let deadListeners: CoreDeadListener[] = [];

const declareDead = (reason: string) => {
    if (dead) return;
    dead = true;

    if (heartbeatTimer !== null) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }

    console.error('core worker considered dead —', reason);
    deadListeners.forEach((listener) => listener(reason));
};

worker.addEventListener('error', (event) => declareDead(event.message || 'worker error event'));
worker.addEventListener('messageerror', () => declareDead('worker messageerror event'));

const withTimeout = <T>(promise: Promise<T>, label: string): Promise<T> => {
    let timer: ReturnType<typeof setTimeout>;

    return Promise.race([
        promise,
        new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error(`${label} timed out after ${BRIDGE_TIMEOUT_MS}ms`)), BRIDGE_TIMEOUT_MS);
        }),
    ]).finally(() => clearTimeout(timer));
};

const call = (path: string[], args: any[], label: string): Promise<any> => {
    if (dead) return Promise.reject(new Error('core worker is unavailable'));

    return withTimeout(bridge.call(path, args), label).catch((error) => {
        if (error?.message?.includes('timed out')) declareDead(error.message);
        throw error;
    });
};

const startHeartbeat = () => {
    if (dead || heartbeatTimer !== null) return;

    heartbeatTimer = setInterval(() => {
        call(['getState'], ['ctx'], 'heartbeat').catch(() => null);
    }, HEARTBEAT_INTERVAL_MS);
};

const createTransport = (): CoreTransport => {
    const init = async (args: object): Promise<void> => {
        await call(['init'], [args], 'init');
        startHeartbeat();
    };

    const getState = (model: string): Promise<object> => {
        return call(['getState'], [model], `getState(${model})`);
    };

    const dispatch = (action: DispatchAction, model?: string): Promise<void> => {
        return call(['dispatch'], [action, model, location.hash], 'dispatch');
    };

    const encodeStream = (stream: Stream): Promise<string> => {
        return call(['encodeStream'], [stream], 'encodeStream');
    };

    const decodeStream = (stream: string): Promise<Stream> => {
        return call(['decodeStream'], [stream], 'decodeStream');
    };

    const analytics = (event: object): Promise<void> => {
        return call(['analytics'], [event, location.hash], 'analytics');
    };

    const onDead = (listener: CoreDeadListener) => {
        deadListeners = [...deadListeners, listener];
        if (dead) listener('core worker is unavailable');
    };

    const offDead = (listener: CoreDeadListener) => {
        deadListeners = deadListeners.filter((l) => l !== listener);
    };

    return {
        init,
        getState,
        dispatch,
        encodeStream,
        decodeStream,
        analytics,
        onDead,
        offDead,
    };
};

export default createTransport;
