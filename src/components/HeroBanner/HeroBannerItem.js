// Copyright (C) 2017-2025 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const UrlUtils = require('url');
const { useNavigate } = require('react-router');
const { useTranslation } = require('react-i18next');
const { useCore } = require('stremio/core');
const { default: useToast } = require('stremio/common/Toast/useToast');
const { default: toPath } = require('stremio-router/toPath');
const { default: Icon } = require('stremio/components/Icon');
const { default: Button } = require('stremio/components/Button');
const { default: Image } = require('stremio/components/Image');
const CONSTANTS = require('stremio/common/CONSTANTS');
const { default: routesRegexp } = require('stremio/common/routesRegexp');
const { parseMetaDetailsHref, resolveFirstPlayableStream } = require('stremio/lib/play-first-stream');
const styles = require('./styles');

const ALLOWED_LINK_REDIRECTS = [
    routesRegexp.search.regexp,
    routesRegexp.discover.regexp,
    routesRegexp.metadetails.regexp
];

const getGenreLinks = (links) => {
    if (!Array.isArray(links)) return [];
    return links
        .filter((link) => {
            if (!link || typeof link.category !== 'string' || typeof link.url !== 'string') return false;
            if (link.category === CONSTANTS.IMDB_LINK_CATEGORY) return false;
            if (link.category === CONSTANTS.SHARE_LINK_CATEGORY) return false;
            if (link.category === CONSTANTS.WRITERS_LINK_CATEGORY) return false;
            return link.category === 'Genres';
        })
        .map(({ name, url }) => {
            const { protocol, path, pathname, hostname } = UrlUtils.parse(url);
            if (protocol === 'stremio:' && pathname !== null && ALLOWED_LINK_REDIRECTS.some((regexp) => pathname.match(regexp))) {
                return { label: name, href: `#${path}` };
            }
            if (typeof hostname === 'string' && hostname.length > 0) {
                return { label: name, href: `https://www.stremio.com/warning#${encodeURIComponent(url)}` };
            }
            return null;
        })
        .filter(Boolean);
};

const HeroBannerItem = ({ className, active, id, type, name, description, releaseInfo, runtime, links, deepLinks, trailerStreams, background, logo, poster }) => {
    const { t } = useTranslation();
    const core = useCore();
    const navigate = useNavigate();
    const toast = useToast();
    const [resolving, setResolving] = React.useState(false);
    const metahubBackground = `https://images.metahub.space/background/medium/${id}/img`;
    const metahubLogo = `https://images.metahub.space/logo/medium/${id}/img`;
    const backgroundSrc = background || poster || metahubBackground;
    const logoSrc = logo || metahubLogo;

    const genreLinks = React.useMemo(() => getGenreLinks(links), [links]);

    const detailsHref = React.useMemo(() => {
        if (!deepLinks) return null;
        return deepLinks.metaDetailsStreams ?? deepLinks.metaDetailsVideos ?? null;
    }, [deepLinks]);

    const playbackTarget = React.useMemo(() => {
        const parsed = parseMetaDetailsHref(detailsHref);
        const contentType = parsed?.type ?? type;
        const contentId = parsed?.contentId ?? id;
        if (typeof contentType !== 'string' || typeof contentId !== 'string') return null;
        return { type: contentType, contentId, videoId: parsed?.videoId ?? null };
    }, [detailsHref, id, type]);

    const trailerHref = React.useMemo(() => {
        if (!Array.isArray(trailerStreams) || trailerStreams.length === 0) return null;
        return trailerStreams[0].deepLinks.player;
    }, [trailerStreams]);

    const renderLogoFallback = React.useCallback(() => (
        <div className={styles['logo-placeholder']}>{name}</div>
    ), [name]);

    const playFirstStream = React.useCallback(async (event) => {
        event.preventDefault();
        if (resolving) return;

        if (typeof deepLinks?.player === 'string') {
            navigate(toPath(deepLinks.player));
            return;
        }

        if (playbackTarget === null) return;
        setResolving(true);
        try {
            const { href } = await resolveFirstPlayableStream({
                transport: core.transport,
                ...playbackTarget,
            });
            navigate(toPath(href));
        } catch (error) {
            toast.show({
                type: 'error',
                title: t('HORIZON_PLAYBACK_FAILED'),
                message: error instanceof Error && error.message.startsWith('HORIZON_')
                    ? t(error.message)
                    : t('HORIZON_PLAYBACK_GENERIC_ERROR'),
                timeout: 6000,
            });
        } finally {
            setResolving(false);
        }
    }, [core, deepLinks, navigate, playbackTarget, resolving, t, toast]);

    return (
        <div className={classnames(className, styles['hero-banner-item'], { [styles['active']]: active })}>
            <div className={styles['background-image-layer']}>
                <Image className={styles['background-image']} src={backgroundSrc} alt={' '} />
            </div>
            <div className={styles['gradient-overlay']} />
            <div className={styles['content-layer']}>
                <Image
                    className={styles['logo']}
                    src={logoSrc}
                    alt={name}
                    renderFallback={renderLogoFallback}
                />
                {
                    (releaseInfo || runtime) ?
                        <div className={styles['meta-info-row']}>
                            {
                                typeof runtime === 'string' && runtime.length > 0 ?
                                    <span className={styles['meta-info-label']}>{runtime}</span>
                                    :
                                    null
                            }
                            {
                                typeof releaseInfo === 'string' && releaseInfo.length > 0 ?
                                    <span className={styles['meta-info-label']}>{releaseInfo}</span>
                                    :
                                    null
                            }
                        </div>
                        :
                        null
                }
                {
                    typeof description === 'string' && description.length > 0 ?
                        <div className={styles['description']}>{description}</div>
                        :
                        null
                }
                {
                    genreLinks.length > 0 ?
                        <div className={styles['genre-links']}>
                            {genreLinks.map(({ label, href }, index) => (
                                <Button key={index} className={styles['genre-link']} href={href}>
                                    {label}
                                </Button>
                            ))}
                        </div>
                        :
                        null
                }
                <div className={styles['action-buttons-row']}>
                    {
                        playbackTarget !== null || typeof deepLinks?.player === 'string' ?
                            <Button
                                className={classnames(styles['action-button'], styles['primary-action'])}
                                disabled={resolving}
                                onClick={playFirstStream}
                            >
                                {
                                    resolving ?
                                        <span className={styles['resolving-spinner']} />
                                        :
                                        <Icon className={styles['icon']} name={'play'} />
                                }
                                <span>{resolving ? t('HORIZON_RESOLVING_STREAM') : t('SHOW')}</span>
                            </Button>
                            :
                            null
                    }
                    {
                        typeof detailsHref === 'string' ?
                            <Button className={classnames(styles['action-button'], styles['secondary-action'])} href={detailsHref}>
                                <Icon className={styles['icon']} name={'info'} />
                                <span>{t('HORIZON_MORE_INFO')}</span>
                            </Button>
                            :
                            null
                    }
                    {
                        typeof trailerHref === 'string' ?
                            <Button className={classnames(styles['action-button'], styles['secondary-action'])} href={trailerHref}>
                                <Icon className={styles['icon']} name={'trailer'} />
                                <span>{t('TRAILER')}</span>
                            </Button>
                            :
                            null
                    }
                </div>
            </div>
        </div>
    );
};

HeroBannerItem.propTypes = {
    className: PropTypes.string,
    active: PropTypes.bool,
    id: PropTypes.string,
    type: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    releaseInfo: PropTypes.string,
    runtime: PropTypes.string,
    links: PropTypes.array,
    deepLinks: PropTypes.shape({
        metaDetailsVideos: PropTypes.string,
        metaDetailsStreams: PropTypes.string,
        player: PropTypes.string
    }),
    trailerStreams: PropTypes.array,
    background: PropTypes.string,
    logo: PropTypes.string,
    poster: PropTypes.string,
};

module.exports = HeroBannerItem;
