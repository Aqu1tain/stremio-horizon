const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { useTranslation } = require('react-i18next');
const { default: Icon } = require('stremio/components/Icon');
const { default: Button } = require('stremio/components/Button');
const { default: Image } = require('stremio/components/Image');
const { default: MainNavBars } = require('stremio/components/MainNavBars');
const ModalDialog = require('stremio/components/ModalDialog');
const SharePrompt = require('stremio/components/SharePrompt');
const { DelayedRenderer, HorizontalNavBar } = require('stremio/components');
const { useServices } = require('stremio/services');
const { withCoreSuspender } = require('stremio/common');
const useBinaryState = require('stremio/common/useBinaryState');
const CONSTANTS = require('stremio/common/CONSTANTS');
const useLinksGroups = require('stremio/components/MetaPreview/useLinksGroups');
const ActionButton = require('stremio/components/MetaPreview/ActionButton');
const { Ratings } = require('stremio/components/MetaPreview/Ratings');
const StreamsList = require('./StreamsList');
const VideosList = require('./VideosList');
const TabBar = require('./TabBar');
const DetailsPanel = require('./DetailsPanel');
const useMetaDetails = require('./useMetaDetails');
const useSeason = require('./useSeason');
const useMetaExtensionTabs = require('./useMetaExtensionTabs');
const styles = require('./styles');

const MetaDetails = ({ urlParams, queryParams }) => {
    const { t } = useTranslation();
    const { core } = useServices();
    const metaDetails = useMetaDetails(urlParams);
    const [season, setSeason] = useSeason(urlParams, queryParams);
    const [extensionTabs, metaExtension, clearMetaExtension] = useMetaExtensionTabs(metaDetails.metaExtensions);
    const [shareModalOpen, openShareModal, closeShareModal] = useBinaryState(false);
    const [activeTab, setActiveTab] = React.useState('streams');

    const [metaPath, streamPath] = React.useMemo(() => {
        return metaDetails.selected !== null
            ? [metaDetails.selected.metaPath, metaDetails.selected.streamPath]
            : [null, null];
    }, [metaDetails.selected]);

    const metaItem = metaDetails.metaItem;
    const isReady = metaItem !== null && metaItem.content.type === 'Ready';
    const meta = isReady ? metaItem.content.content : null;

    const linksGroups = useLinksGroups(meta?.links);

    const video = React.useMemo(() => {
        if (streamPath === null || !isReady) return null;
        return meta.videos.find((v) => v.id === streamPath.id) ?? null;
    }, [metaItem, streamPath, isReady]);

    const hasVideos = React.useMemo(() => {
        return isReady && meta.videos.length > 0;
    }, [isReady, meta]);

    const firstStreamHref = React.useMemo(() => {
        const ready = metaDetails.streams
            .filter((s) => s.content.type === 'Ready')
            .flatMap((s) => s.content.content);
        return ready[0]?.deepLinks?.player ?? null;
    }, [metaDetails.streams]);

    const seriesPlayAction = React.useMemo(() => {
        if (!hasVideos || !isReady) return null;

        const sorted = [...meta.videos].sort((a, b) => {
            if ((a.season ?? 0) !== (b.season ?? 0)) return (a.season ?? 0) - (b.season ?? 0);
            return (a.episode ?? 0) - (b.episode ?? 0);
        });

        const libraryVideoId = metaDetails.libraryItem?.state?.video_id;
        if (libraryVideoId) {
            const resumeIdx = sorted.findIndex((v) => v.id === libraryVideoId);
            if (resumeIdx !== -1) {
                const resumeVideo = sorted[resumeIdx];
                if (!resumeVideo.watched) {
                    const href = resumeVideo.deepLinks?.player ?? resumeVideo.deepLinks?.metaDetailsStreams ?? null;
                    const label = resumeVideo.season != null
                        ? `Resume S${resumeVideo.season} E${resumeVideo.episode}`
                        : `Resume E${resumeVideo.episode}`;
                    return { label, href };
                }
                const nextUnwatched = sorted.slice(resumeIdx + 1).find((v) => !v.watched && !v.upcoming);
                if (nextUnwatched) {
                    const href = nextUnwatched.deepLinks?.player ?? nextUnwatched.deepLinks?.metaDetailsStreams ?? null;
                    const label = nextUnwatched.season != null
                        ? `Play S${nextUnwatched.season} E${nextUnwatched.episode}`
                        : `Play E${nextUnwatched.episode}`;
                    return { label, href };
                }
            }
        }

        const nonSpecials = sorted.filter((v) => v.season !== 0);
        const candidates = nonSpecials.length > 0 ? nonSpecials : sorted;
        const firstUnwatched = candidates.find((v) => !v.watched && !v.upcoming);
        const target = firstUnwatched ?? candidates[0];
        if (!target) return null;

        const href = target.deepLinks?.player ?? target.deepLinks?.metaDetailsStreams ?? null;
        const label = target.season != null
            ? `Play S${target.season} E${target.episode}`
            : `Play E${target.episode}`;
        return { label, href };
    }, [hasVideos, isReady, meta, metaDetails.libraryItem]);

    const trailerHref = React.useMemo(() => {
        if (!isReady || !Array.isArray(meta.trailerStreams) || meta.trailerStreams.length === 0) return null;
        return meta.trailerStreams[0].deepLinks.player;
    }, [isReady, meta]);

    const tabs = React.useMemo(() => {
        const result = [];
        if (streamPath && !hasVideos) result.push({ id: 'streams', label: 'Streams' });
        if (hasVideos) result.push({ id: 'episodes', label: 'Episodes' });
        result.push({ id: 'details', label: 'Details' });
        return result;
    }, [metaPath, streamPath, hasVideos]);

    React.useEffect(() => {
        if (streamPath !== null && !hasVideos) setActiveTab('streams');
        else if (hasVideos) setActiveTab('episodes');
        else setActiveTab('details');
    }, [streamPath, metaPath, hasVideos]);

    const addToLibrary = React.useCallback(() => {
        if (!isReady) return;
        core.transport.dispatch({
            action: 'Ctx',
            args: { action: 'AddToLibrary', args: meta }
        });
    }, [metaDetails]);

    const removeFromLibrary = React.useCallback(() => {
        if (!isReady) return;
        core.transport.dispatch({
            action: 'Ctx',
            args: { action: 'RemoveFromLibrary', args: meta.id }
        });
    }, [metaDetails]);

    const toggleNotifications = React.useCallback(() => {
        if (!metaDetails.libraryItem) return;
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'ToggleLibraryItemNotifications',
                args: [metaDetails.libraryItem._id, !metaDetails.libraryItem.state.noNotif],
            }
        });
    }, [metaDetails.libraryItem]);

    const seasonOnSelect = React.useCallback((event) => {
        setSeason(event.value);
    }, [setSeason]);

    const handleEpisodeSearch = React.useCallback((seasonNum, episode) => {
        const searchVideoHash = encodeURIComponent(`${urlParams.id}:${seasonNum}:${episode}`);
        const url = window.location.hash;
        const searchVideoPath = (!urlParams.videoId)
            ? url + (!url.endsWith('/') ? '/' : '') + searchVideoHash
            : url.replace(encodeURIComponent(urlParams.videoId), searchVideoHash);
        window.location = searchVideoPath;
    }, [urlParams]);

    const [descriptionTruncated, setDescriptionTruncated] = React.useState(false);

    const descriptionRef = React.useCallback((el) => {
        if (!el) return setDescriptionTruncated(false);
        requestAnimationFrame(() => {
            el.style.webkitLineClamp = 'unset';
            el.style.display = 'block';
            const fullHeight = el.scrollHeight;
            el.style.webkitLineClamp = '';
            el.style.display = '';
            setDescriptionTruncated(fullHeight > el.clientHeight);
        });
    }, [description]);

    const showDetails = React.useCallback(() => setActiveTab('details'), []);

    const renderBackgroundImageFallback = React.useCallback(() => null, []);

    const resumeVideo = React.useMemo(() => {
        if (!isReady || !hasVideos) return null;
        const libraryVideoId = metaDetails.libraryItem?.state?.video_id;
        if (!libraryVideoId) return null;
        return meta.videos.find((v) => v.id === libraryVideoId) ?? null;
    }, [isReady, hasVideos, meta, metaDetails.libraryItem]);

    const description = React.useMemo(() => {
        if (video !== null && typeof video.overview === 'string' && video.overview.length > 0) return video.overview;
        if (resumeVideo !== null && typeof resumeVideo.overview === 'string' && resumeVideo.overview.length > 0) return resumeVideo.overview;
        return meta?.description ?? null;
    }, [video, resumeVideo, meta]);

    if (metaPath === null) {
        return (
            <MainNavBars className={styles['metadetails-container']} route={'metadetails'} overlay>
                <DelayedRenderer delay={500}>
                    <div className={styles['meta-message-container']}>
                        <Image className={styles['message-image']} src={require('/assets/images/empty.png')} alt={' '} />
                        <div className={styles['message-label']}>{t('ERR_NO_META_SELECTED')}</div>
                    </div>
                </DelayedRenderer>
            </MainNavBars>
        );
    }

    if (metaItem === null) {
        return (
            <MainNavBars className={styles['metadetails-container']} route={'metadetails'} overlay>
                <div className={styles['meta-message-container']}>
                    <Image className={styles['message-image']} src={require('/assets/images/empty.png')} alt={' '} />
                    <div className={styles['message-label']}>{t('ERR_NO_ADDONS_FOR_META')}</div>
                </div>
            </MainNavBars>
        );
    }

    if (metaItem.content.type === 'Err') {
        return (
            <MainNavBars className={styles['metadetails-container']} route={'metadetails'} overlay>
                <div className={styles['meta-message-container']}>
                    <Image className={styles['message-image']} src={require('/assets/images/empty.png')} alt={' '} />
                    <div className={styles['message-label']}>{t('ERR_NO_META_FOUND')}</div>
                </div>
            </MainNavBars>
        );
    }

    if (metaItem.content.type === 'Loading') {
        return (
            <MainNavBars className={styles['metadetails-container']} route={'metadetails'} overlay>
                <div className={styles['loading-container']} />
            </MainNavBars>
        );
    }

    return (
        <MainNavBars className={styles['metadetails-container']} route={'metadetails'} overlay>
            <div className={styles['metadetails-scroll-container']}>
                <div className={styles['hero-section']}>
                    {typeof meta.background === 'string' && meta.background.length > 0 &&
                        <Image
                            className={styles['hero-background-image']}
                            src={meta.background}
                            renderFallback={renderBackgroundImageFallback}
                            alt={' '}
                        />
                    }
                    <div className={styles['hero-gradient']} />
                    <div className={styles['hero-content']}>
                        {typeof meta.logo === 'string' && meta.logo.length > 0
                            ? <Image className={styles['hero-logo']} src={meta.logo} alt={meta.name} renderFallback={() => (
                                <div className={styles['hero-title']}>{meta.name}</div>
                            )} />
                            : <div className={styles['hero-title']}>{meta.name}</div>
                        }
                        <div className={styles['hero-meta-row']}>
                            {typeof meta.runtime === 'string' && meta.runtime.length > 0 &&
                                <span className={styles['meta-info']}>{meta.runtime}</span>
                            }
                            {typeof meta.releaseInfo === 'string' && meta.releaseInfo.length > 0
                                ? <span className={styles['meta-info']}>{meta.releaseInfo}</span>
                                : meta.released instanceof Date && !isNaN(meta.released.getTime()) &&
                                    <span className={styles['meta-info']}>{meta.released.getFullYear()}</span>
                            }
                            {linksGroups.has(CONSTANTS.IMDB_LINK_CATEGORY) &&
                                <Button
                                    className={styles['imdb-badge']}
                                    title={linksGroups.get(CONSTANTS.IMDB_LINK_CATEGORY).label}
                                    href={linksGroups.get(CONSTANTS.IMDB_LINK_CATEGORY).href}
                                    target={'_blank'}
                                >
                                    <span>{linksGroups.get(CONSTANTS.IMDB_LINK_CATEGORY).label}</span>
                                    <Icon className={styles['imdb-icon']} name={'imdb'} />
                                </Button>
                            }
                        </div>
                        {typeof description === 'string' && description.length > 0 &&
                            <div className={styles['hero-description-container']}>
                                <div ref={descriptionRef} className={styles['hero-description']}>{description}</div>
                                {descriptionTruncated &&
                                    <Button className={styles['see-more']} onClick={showDetails}>See more</Button>
                                }
                            </div>
                        }
                        <div className={styles['hero-actions']}>
                            {hasVideos && seriesPlayAction !== null && typeof seriesPlayAction.href === 'string' &&
                                <Button className={styles['play-button']} href={seriesPlayAction.href}>
                                    <Icon className={styles['play-icon']} name={'play'} />
                                    <span>{seriesPlayAction.label}</span>
                                </Button>
                            }
                            {!hasVideos && typeof firstStreamHref === 'string' &&
                                <Button className={styles['play-button']} href={firstStreamHref}>
                                    <Icon className={styles['play-icon']} name={'play'} />
                                    <span>Play</span>
                                </Button>
                            }
                            {typeof meta.inLibrary === 'boolean' &&
                                <ActionButton
                                    className={styles['action-button']}
                                    icon={meta.inLibrary ? 'remove-from-library' : 'add-to-library'}
                                    label={meta.inLibrary ? t('REMOVE_FROM_LIB') : t('ADD_TO_LIB')}
                                    onClick={meta.inLibrary ? removeFromLibrary : addToLibrary}
                                />
                            }
                            {typeof trailerHref === 'string' &&
                                <ActionButton
                                    className={styles['action-button']}
                                    icon={'trailer'}
                                    label={t('TRAILER')}
                                    href={trailerHref}
                                />
                            }
                            {metaDetails.ratingInfo !== null &&
                                <Ratings
                                    ratingInfo={metaDetails.ratingInfo}
                                    className={styles['ratings']}
                                />
                            }
                            {linksGroups.has(CONSTANTS.SHARE_LINK_CATEGORY) &&
                                <ActionButton
                                    className={styles['action-button']}
                                    icon={'share'}
                                    label={t('CTX_SHARE')}
                                    tooltip={true}
                                    onClick={openShareModal}
                                />
                            }
                        </div>
                    </div>
                </div>
                <TabBar
                    className={styles['tab-bar']}
                    tabs={tabs}
                    selected={activeTab}
                    onSelect={setActiveTab}
                />
                <div className={styles['tab-content']}>
                    {activeTab === 'streams' && streamPath !== null &&
                        <StreamsList
                            className={styles['streams-list']}
                            streams={metaDetails.streams}
                            video={video}
                            type={streamPath.type}
                            onEpisodeSearch={handleEpisodeSearch}
                        />
                    }
                    {activeTab === 'episodes' && metaPath !== null && (
                        streamPath !== null ?
                            <StreamsList
                                className={styles['streams-list']}
                                streams={metaDetails.streams}
                                video={video}
                                type={streamPath.type}
                                onEpisodeSearch={handleEpisodeSearch}
                            />
                            :
                            <VideosList
                                className={styles['videos-list']}
                                metaItem={metaDetails.metaItem}
                                libraryItem={metaDetails.libraryItem}
                                season={season}
                                selectedVideoId={null}
                                seasonOnSelect={seasonOnSelect}
                                toggleNotifications={toggleNotifications}
                            />
                    )}
                    {activeTab === 'details' &&
                        <DetailsPanel
                            className={styles['details-panel']}
                            description={meta.description}
                            linksGroups={linksGroups}
                        />
                    }
                </div>
            </div>
            {shareModalOpen &&
                <ModalDialog title={t('CTX_SHARE')} onCloseRequest={closeShareModal}>
                    <SharePrompt
                        className={styles['share-prompt']}
                        url={linksGroups.get(CONSTANTS.SHARE_LINK_CATEGORY).href}
                    />
                </ModalDialog>
            }
            {metaExtension !== null &&
                <ModalDialog
                    className={styles['meta-extension-modal-container']}
                    title={metaExtension.name}
                    onCloseRequest={clearMetaExtension}>
                    <iframe
                        className={styles['meta-extension-modal-iframe']}
                        sandbox={'allow-forms allow-scripts allow-same-origin'}
                        src={metaExtension.url}
                    />
                </ModalDialog>
            }
        </MainNavBars>
    );
};

MetaDetails.propTypes = {
    urlParams: PropTypes.shape({
        type: PropTypes.string,
        id: PropTypes.string,
        videoId: PropTypes.string
    }),
    queryParams: PropTypes.instanceOf(URLSearchParams)
};

const MetaDetailsFallback = () => (
    <div className={styles['metadetails-container']}>
        <HorizontalNavBar
            className={styles['nav-bar']}
            backButton={true}
            navMenu={true}
        />
    </div>
);

module.exports = withCoreSuspender(MetaDetails, MetaDetailsFallback);
