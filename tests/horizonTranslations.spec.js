const canonicalInterfaceLanguage = require('../src/common/canonicalInterfaceLanguage');
const horizonTranslations = require('../src/horizon-translations');

describe('Horizon translations', () => {
    test('normalizes legacy and short French language codes', () => {
        expect(canonicalInterfaceLanguage('fre')).toBe('fr-FR');
        expect(canonicalInterfaceLanguage('fr')).toBe('fr-FR');
        expect(canonicalInterfaceLanguage('fr-FR')).toBe('fr-FR');
    });

    test('overrides untranslated download labels in French', () => {
        const french = horizonTranslations['fr-FR'];
        expect(french.DOWNLOADS).toBe('Téléchargements');
        expect(french.BUTTON_DELETE).toBe('Supprimer');
        expect(french.NO_DOWNLOADS_IN_PROGRESS).toBe('Aucun téléchargement');
        expect(french.HORIZON_EPISODE_COUNT_other).toBe('{{count}} épisodes');
    });

    test('uses the translated downloads key in navigation', () => {
        const source = require('fs').readFileSync(
            require('path').join(__dirname, '../src/components/MainNavBars/MainNavBars.tsx'),
            'utf8'
        );
        expect(source).toContain("id: 'downloads', label: 'DOWNLOADS'");
        expect(source).toContain("id: 'board', label: 'WEBSITE_PAGE_HOME'");
        expect(source).toContain("id: 'addons', label: 'WEBSITE_PAGE_ADDONS'");
    });
});
