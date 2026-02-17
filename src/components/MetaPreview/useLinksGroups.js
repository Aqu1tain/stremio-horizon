const React = require('react');
const UrlUtils = require('url');
const CONSTANTS = require('stremio/common/CONSTANTS');
const { default: routesRegexp } = require('stremio/common/routesRegexp');

const ALLOWED_LINK_REDIRECTS = [
    routesRegexp.search.regexp,
    routesRegexp.discover.regexp,
    routesRegexp.metadetails.regexp
];

const useLinksGroups = (links) => {
    return React.useMemo(() => {
        if (!Array.isArray(links)) return new Map();

        return links
            .filter((link) => link && typeof link.category === 'string' && typeof link.url === 'string')
            .reduce((groups, { category, name, url }) => {
                const { protocol, path, pathname, hostname } = UrlUtils.parse(url);

                if (category === CONSTANTS.IMDB_LINK_CATEGORY) {
                    if (hostname === 'imdb.com') {
                        groups.set(category, {
                            label: name,
                            href: `https://www.stremio.com/warning#${encodeURIComponent(url)}`
                        });
                    }
                } else if (category === CONSTANTS.SHARE_LINK_CATEGORY) {
                    groups.set(category, {
                        label: name,
                        href: url
                    });
                } else if (protocol === 'stremio:') {
                    if (pathname !== null && ALLOWED_LINK_REDIRECTS.some((regexp) => pathname.match(regexp))) {
                        if (!groups.has(category)) groups.set(category, []);
                        groups.get(category).push({ label: name, href: `#${path}` });
                    }
                } else if (typeof hostname === 'string' && hostname.length > 0) {
                    if (!groups.has(category)) groups.set(category, []);
                    groups.get(category).push({
                        label: name,
                        href: `https://www.stremio.com/warning#${encodeURIComponent(url)}`
                    });
                }

                return groups;
            }, new Map());
    }, [links]);
};

module.exports = useLinksGroups;
