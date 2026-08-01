const React = require('react');
const { useParams, useLocation, useNavigate } = require('react-router');
const { useTranslation } = require('react-i18next');
const { default: Icon } = require('stremio/components/Icon');
const { default: Button } = require('stremio/components/Button');
const { default: Image } = require('stremio/components/Image');
const { default: MainNavBars } = require('stremio/components/MainNavBars');
const ModalDialog = require('stremio/components/ModalDialog');
const SharePrompt = require('stremio/components/SharePrompt');
const { DelayedRenderer } = require('stremio/components');
const { RouteLoading } = require('stremio/components/RouteLoading');
const { useCore } = require('stremio/core');
const { useContentGamepadNavigation } = require('stremio/services/GamepadNavigation');
const { withCoreSuspender, useToast } = require('stremio/common');
const { default: useBinaryState } = require('stremio/common/useBinaryState');
const CONSTANTS = require('stremio/common/CONSTANTS');
const { downloadsAvailable, startDownload } = require('stremio/lib/downloads');
const { createMetaDetailsLoadAction, waitForResolvedStream, waitForSelection } = require('stremio/lib/episode-download');
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

const GAMEPAD_HANDLER_ID = 'metadetails';

const MetaDetails = () => {
    const { type, id, videoId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const contentRef = React.useRef(null);
    const { t } = useTranslation();
    const core = useCore();
    const toast = useToast();
    const urlParams = React.useMemo(() => ({
        type,
        id,
        videoId
    }), [type, id, videoId]);
    const metaDetails = useMetaDetails(urlParams);
    const [season, setSeason] = useSeason();
    const [, metaExtension, clearMetaExtension] = useMetaExtensionTabs(metaDetails.metaExtensions);
    const [shareModalOpen, openShareModal, closeShareModal] = useBinaryState(false);
    const [activeTab, setActiveTab] = React.useState('streams');
    const [resolvingVideoId, setResolvingVideoId] = React.useState(null);

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

        const isReleased = (v) => !v.upcoming && v.released instanceof Date && !isNaN(v.released.getTime());
        const hrefOf = (v) => v.deepLinks?.player ?? v.deepLinks?.metaDetailsStreams ?? null;
        const makeAction = (verb, video) => ({
            href: hrefOf(video),
            label: video.season !== null
                ? `${verb} S${video.season} E${video.episode}`
                : `${verb} E${video.episode}`,
        });

        const sorted = [...meta.videos].sort((a, b) => {
            if ((a.season ?? 0) !== (b.season ?? 0)) return (a.season ?? 0) - (b.season ?? 0);
            return (a.episode ?? 0) - (b.episode ?? 0);
        });

        const libraryVideoId = metaDetails.libraryItem?.state?.video_id;
        if (libraryVideoId) {
            const resumeIdx = sorted.findIndex((v) => v.id === libraryVideoId);
            if (resumeIdx !== -1) {
                const resumeVideo = sorted[resumeIdx];
                if (!resumeVideo.watched) return makeAction(t('LIBRARY_RESUME'), resumeVideo);
                const nextUnwatched = sorted.slice(resumeIdx + 1).find((v) => !v.watched && isReleased(v));
                if (nextUnwatched) return makeAction(t('LIBRARY_PLAY'), nextUnwatched);
            }
        }

        const nonSpecials = sorted.filter((v) => v.season !== 0);
        const candidates = nonSpecials.length > 0 ? nonSpecials : sorted;
        const firstUnwatched = candidates.find((v) => !v.watched && isReleased(v));
        const target = firstUnwatched ?? candidates.find((v) => isReleased(v)) ?? null;
        if (!target) return null;

        const verb = firstUnwatched ? t('LIBRARY_PLAY') : t('LIBRARY_REWATCH');
        return makeAction(verb, target);
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
        const url = location.pathname;
        const searchVideoPath = (!urlParams.videoId)
            ? url + (!url.endsWith('/') ? '/' : '') + searchVideoHash
            : url.replace(encodeURIComponent(urlParams.videoId), searchVideoHash);
        navigate(searchVideoPath, { replace: true });
    }, [urlParams, location, navigate]);

    const downloadEpisode = React.useCallback(async (targetVideo) => {
        if (!downloadsAvailable() || !isReady || resolvingVideoId !== null) return;

        const originalVideoId = typeof urlParams.videoId === 'string' && urlParams.videoId.length > 0
            ? urlParams.videoId
            : null;
        setResolvingVideoId(targetVideo.id);

        try {
            await core.transport.dispatch(createMetaDetailsLoadAction({
                type: meta.type,
                contentId: meta.id,
                videoId: targetVideo.id,
            }), 'meta_details');
            const { addon, stream, url: downloadUrl } = await waitForResolvedStream(core.transport, targetVideo.id);
            await startDownload({
                url: downloadUrl,
                title: meta.name,
                subtitle: [
                    typeof targetVideo.season === 'number' && typeof targetVideo.episode === 'number'
                        ? `S${targetVideo.season} E${targetVideo.episode}`
                        : null,
                    targetVideo.title,
                ].filter(Boolean).join(' · '),
                contentType: meta.type,
                contentId: meta.id,
                videoId: targetVideo.id,
                season: typeof targetVideo.season === 'number' ? targetVideo.season : null,
                episode: typeof targetVideo.episode === 'number' ? targetVideo.episode : null,
                description: targetVideo.overview || meta.description || null,
                sourceName: [addon?.manifest?.name, stream.name].filter(Boolean).join(' · ') || null,
                thumbnailUrl: targetVideo.thumbnail || meta.poster || meta.background || null,
                fileName: stream.deepLinks?.externalPlayer?.fileName || null,
            });
            toast.show({
                type: 'success',
                title: t('DOWNLOADS_IN_PROGRESS'),
                message: t('HORIZON_EPISODE_DOWNLOAD_STARTED'),
                timeout: 4000,
            });
        } catch (downloadError) {
            toast.show({
                type: 'error',
                title: t('HORIZON_DOWNLOAD_FAILED'),
                message: downloadError instanceof Error && downloadError.message.startsWith('HORIZON_')
                    ? t(downloadError.message)
                    : t('HORIZON_DOWNLOAD_GENERIC_ERROR'),
                timeout: 6000,
            });
        } finally {
            await core.transport.dispatch(createMetaDetailsLoadAction({
                type: meta.type,
                contentId: meta.id,
                videoId: originalVideoId,
            }), 'meta_details').catch(() => undefined);
            await waitForSelection(core.transport, originalVideoId).catch(() => undefined);
            setResolvingVideoId(null);
        }
    }, [core, isReady, meta, resolvingVideoId, t, toast, urlParams.videoId]);

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

    useContentGamepadNavigation(contentRef, GAMEPAD_HANDLER_ID);

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
        return <RouteLoading pathname={'/metadetails'} />;
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
                                    <Button className={styles['see-more']} onClick={showDetails}>{t('SHOW_MORE')}</Button>
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
                                    <span>{t('LIBRARY_PLAY')}</span>
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
                <div ref={contentRef} className={styles['tab-content']}>
                    {activeTab === 'streams' && streamPath !== null &&
                        <StreamsList
                            className={styles['streams-list']}
                            streams={metaDetails.streams}
                            video={video}
                            contentId={meta.id}
                            contentTitle={meta.name}
                            contentDescription={description}
                            contentThumbnail={video?.thumbnail || meta.poster || meta.background}
                            type={streamPath.type}
                            onEpisodeSearch={handleEpisodeSearch}
                        />
                    }
                    {activeTab === 'episodes' && metaPath !== null && (
                        streamPath !== null && resolvingVideoId === null ?
                            <StreamsList
                                className={styles['streams-list']}
                                streams={metaDetails.streams}
                                video={video}
                                contentId={meta.id}
                                contentTitle={meta.name}
                                contentDescription={description}
                                contentThumbnail={video?.thumbnail || meta.poster || meta.background}
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
                                resolvingVideoId={resolvingVideoId}
                                onDownloadVideo={downloadsAvailable() ? downloadEpisode : null}
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

const MetaDetailsFallback = () => <RouteLoading pathname={'/metadetails'} />;

module.exports = withCoreSuspender(MetaDetails, MetaDetailsFallback);
