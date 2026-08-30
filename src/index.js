// Copyright (C) 2017-2023 Smart code 203358507

if (typeof process.env.SENTRY_DSN === 'string') {
    const Sentry = require('@sentry/browser');
    Sentry.init({ dsn: process.env.SENTRY_DSN });
}

const Bowser = require('bowser');
const browser = Bowser.parse(window.navigator?.userAgent || '');
if (browser?.platform?.type === 'desktop') {
    document.querySelector('meta[name="viewport"]')?.setAttribute('content', '');
}

const React = require('react');
const ReactDOM = require('react-dom/client');
const { HashRouter } = require('react-router-dom');
const i18n = require('i18next');
const { initReactI18next } = require('react-i18next');
const horizonTranslations = require('./horizon-translations');
const { createTranslationBackend } = require('./common/translationBackend');
const App = require('./App');
const { CoreProvider } = require('./core');
const { FileDropProvider, PlatformProvider } = require('./common');

const initialLanguage = 'en-US';
const initialTranslations = require('stremio-translations/en-US.json');
const translationBackend = createTranslationBackend(horizonTranslations);

i18n
    .use(translationBackend)
    .use(initReactI18next)
    .init({
        resources: {
            [initialLanguage]: {
                translation: {
                    ...initialTranslations,
                    ...(horizonTranslations[initialLanguage] || {})
                }
            }
        },
        partialBundledLanguages: true,
        load: 'currentOnly',
        lng: initialLanguage,
        fallbackLng: initialLanguage,
        interpolation: {
            escapeValue: false
        }
    });

const appInfo = {
    appVersion: process.env.VERSION,
    shellVersion: null
};

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
    <React.StrictMode>
        <PlatformProvider>
            <CoreProvider appInfo={appInfo}>
                <FileDropProvider>
                    <HashRouter>
                        <App />
                    </HashRouter>
                </FileDropProvider>
            </CoreProvider>
        </PlatformProvider>
    </React.StrictMode>
);

if (process.env.NODE_ENV === 'production' && process.env.SERVICE_WORKER_DISABLED !== 'true' && process.env.SERVICE_WORKER_DISABLED !== true && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .catch((registrationError) => {
                console.error('SW registration failed: ', registrationError);
            });
    });
}
