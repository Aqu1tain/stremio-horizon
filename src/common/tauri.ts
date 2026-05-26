const getTauriInternals = () => globalThis.__TAURI_INTERNALS__ ?? null;

export const isTauri = () => getTauriInternals() !== null;

export const invokeTauri = <T = unknown, A extends Record<string, unknown> = Record<string, unknown>>(cmd: string, args?: A): Promise<T> => {
    const tauri = getTauriInternals();
    if (tauri === null) {
        return Promise.reject(new Error('Tauri is not available'));
    }

    return tauri.invoke<T>(cmd, args || {});
};

type TauriEventTarget = {
    kind: 'Any',
};

type TauriListenArgs = {
    event: string,
    target: TauriEventTarget,
    handler: number,
};

type TauriUnlistenArgs = {
    event: string,
    eventId: number,
};

export type TauriEvent<T> = {
    event: string,
    id: number,
    payload: T,
};

export const listenTauri = async <T = unknown>(
    event: string,
    handler: (event: TauriEvent<T>) => void
): Promise<() => Promise<void>> => {
    const tauri = getTauriInternals();
    if (tauri === null) {
        throw new Error('Tauri is not available');
    }

    const handlerId = tauri.transformCallback((payload: TauriEvent<T>) => {
        handler(payload);
    });

    const eventId = await invokeTauri<number, TauriListenArgs>('plugin:event|listen', {
        event,
        target: { kind: 'Any' },
        handler: handlerId
    });

    return async () => {
        tauri.unregisterCallback(handlerId);
        await invokeTauri<void, TauriUnlistenArgs>('plugin:event|unlisten', { event, eventId });
    };
};
