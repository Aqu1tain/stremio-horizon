// Copyright (C) 2017-2026 Smart code 203358507

const { describe, expect, jest, test } = require('@jest/globals');
const { createTranslationBackend } = require('../src/common/translationBackend');

describe('translation backend', () => {
    test('loads one locale and applies Horizon overrides', async () => {
        const loader = jest.fn().mockResolvedValue({
            default: {
                PLAY: 'Lire',
                DOWNLOADS: 'Téléchargements upstream',
            }
        });
        const backend = createTranslationBackend({
            'fr-FR': {
                DOWNLOADS: 'Téléchargements Horizon',
            }
        }, loader);

        const translations = await new Promise((resolve, reject) => {
            backend.read('fr-FR', 'translation', (error, result) => error ? reject(error) : resolve(result));
        });

        expect(loader).toHaveBeenCalledWith('fr-FR');
        expect(translations).toEqual({
            PLAY: 'Lire',
            DOWNLOADS: 'Téléchargements Horizon',
        });
    });

    test('reports a locale chunk loading failure to i18next', async () => {
        const error = new Error('chunk unavailable');
        const backend = createTranslationBackend({}, jest.fn().mockRejectedValue(error));

        const result = await new Promise((resolve) => {
            backend.read('fr-FR', 'translation', (loadError, translations) => resolve({ loadError, translations }));
        });

        expect(result).toEqual({ loadError: error, translations: false });
    });
});
