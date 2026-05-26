type QtTransportMessage = {
    data: string;
};

interface QtTransport {
    send: (message: string) => void,
    onmessage: (message: QtTransportMessage) => void,
}

interface Qt {
    webChannelTransport: QtTransport,
}

interface ChromeWebView {
    addEventListener: (type: 'message', listenenr: (event: MessageEvent<unknown>) => void) => void,
    removeEventListener: (type: 'message', listenenr: (event: MessageEvent<unknown>) => void) => void,
    postMessage: (message: string) => void,
}

interface Chrome {
    webview: ChromeWebView,
}

type TauriInvokeArgs = Record<string, unknown>;

interface TauriInternals {
    invoke: <T = unknown>(cmd: string, args?: TauriInvokeArgs) => Promise<T>,
    transformCallback: <T = unknown>(callback: (payload: T) => void, once?: boolean) => number,
    unregisterCallback: (id: number) => void,
}

declare global {
    var qt: Qt | undefined;
    var chrome: Chrome | undefined;
    var __TAURI_INTERNALS__: TauriInternals | undefined;
}

export { };
