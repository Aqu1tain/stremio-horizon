// Copyright (C) 2017-2026 Smart code 203358507

const loadTranslations = (language) => import(
    /* webpackChunkName: "locale-[request]" */
    /* webpackInclude: /[a-z]{2}-[A-Z]{2}\.json$/ */
    `stremio-translations/${language}.json`
);

const createTranslationBackend = (overrides, loader = loadTranslations) => ({
    type: 'backend',
    init: () => undefined,
    read: (language, _namespace, callback) => {
        loader(language)
            .then((translationModule) => callback(null, {
                ...(translationModule.default || translationModule),
                ...(overrides[language] || {})
            }))
            .catch((error) => callback(error, false));
    }
});

module.exports = {
    createTranslationBackend,
};
