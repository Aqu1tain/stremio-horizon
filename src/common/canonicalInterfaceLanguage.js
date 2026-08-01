// Copyright (C) 2017-2026 Smart code 203358507

const interfaceLanguages = require('./interfaceLanguages.json');

const canonicalInterfaceLanguage = (language) => {
    if (typeof language !== 'string') return language;
    const normalized = language.trim().toLowerCase();
    const match = interfaceLanguages.find(({ codes }) => {
        return codes.some((code) => code.toLowerCase() === normalized) ||
            codes[0].split('-')[0].toLowerCase() === normalized;
    });
    return match?.codes[0] ?? language;
};

module.exports = canonicalInterfaceLanguage;
