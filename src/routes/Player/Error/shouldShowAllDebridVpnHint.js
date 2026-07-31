// Copyright (C) 2017-2026 Smart code 203358507

const ALLDEBRID_HOSTNAMES = [
    'alldebrid.com',
    'debrid.it',
];

const isAllDebridUrl = (value) => {
    if (typeof value !== 'string' || value.length === 0) {
        return false;
    }

    try {
        const { hostname } = new URL(value);

        return ALLDEBRID_HOSTNAMES.some((allDebridHostname) => {
            return hostname === allDebridHostname || hostname.endsWith(`.${allDebridHostname}`);
        });
    } catch (_error) {
        return false;
    }
};

const shouldShowAllDebridVpnHint = (code, stream) => {
    if (code !== 4) {
        return false;
    }

    const externalPlayer = stream?.deepLinks?.externalPlayer;
    const urls = [
        stream?.url,
        stream?.externalUrl,
        externalPlayer?.streaming,
        externalPlayer?.download,
        externalPlayer?.playlist,
    ];

    return urls.some(isAllDebridUrl);
};

module.exports = shouldShowAllDebridVpnHint;
