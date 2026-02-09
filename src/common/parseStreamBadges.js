const BADGE_PATTERNS = [
    { pattern: /2160p|4K/i, label: '4K', color: '#16a34a' },
    { pattern: /1080p/i, label: '1080p', color: '#2563eb' },
    { pattern: /720p/i, label: '720p', color: '#6b7280' },
    { pattern: /HDR10\+?|HDR/i, label: 'HDR', color: '#d97706' },
    { pattern: /DV|Dolby.Vision/i, label: 'DV', color: '#7c3aed' },
    { pattern: /HEVC|H\.?265|x265/i, label: 'HEVC', color: '#525252' },
    { pattern: /ATMOS|Dolby.Atmos/i, label: 'Atmos', color: '#0891b2' },
];

const parseStreamBadges = (name, description) => {
    const text = [name, description].filter(Boolean).join(' ');
    const seen = new Set();
    return BADGE_PATTERNS.reduce((badges, { pattern, label, color }) => {
        if (pattern.test(text) && !seen.has(label)) {
            seen.add(label);
            badges.push({ label, color });
        }
        return badges;
    }, []);
};

module.exports = parseStreamBadges;
