// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { useTranslation } = require('react-i18next');
const { default: Icon } = require('stremio/components/Icon');
const { default: Button } = require('stremio/components/Button');
const { default: Image } = require('stremio/components/Image');
const { default: ActionsGroup } = require('stremio/components/ActionsGroup');
const ModalDialog = require('stremio/components/ModalDialog');
const SharePrompt = require('stremio/components/SharePrompt');
const CONSTANTS = require('stremio/common/CONSTANTS');
const { default: useBinaryState } = require('stremio/common/useBinaryState');
const useLinksGroups = require('./useLinksGroups');
const ActionButton = require('./ActionButton');
const MetaLinks = require('./MetaLinks');
const MetaPreviewPlaceholder = require('./MetaPreviewPlaceholder');
const styles = require('./styles');
const { Ratings } = require('./Ratings');

const MetaPreview = React.forwardRef(({ className, compact, name, logo, background, runtime, releaseInfo, released, description, deepLinks, links, trailerStreams, inLibrary, toggleInLibrary, watched, toggleWatched, ratingInfo }, ref) => {
    const { t } = useTranslation();
    const [shareModalOpen, openShareModal, closeShareModal] = useBinaryState(false);
    const linksGroups = useLinksGroups(links);
    const showHref = React.useMemo(() => {
        return deepLinks ?
            typeof deepLinks.player === 'string' ?
                deepLinks.player
                :
                typeof deepLinks.metaDetailsStreams === 'string' ?
                    deepLinks.metaDetailsStreams
                    :
                    typeof deepLinks.metaDetailsVideos === 'string' ?
                        deepLinks.metaDetailsVideos
                        :
                        null
            :
            null;
    }, [deepLinks]);
    const trailerHref = React.useMemo(() => {
        if (!Array.isArray(trailerStreams) || trailerStreams.length === 0) {
            return null;
        }

        return trailerStreams[0].deepLinks.player;
    }, [trailerStreams]);
    const renderLogoFallback = React.useCallback(() => (
        <div className={styles['logo-placeholder']}>{name}</div>
    ), [name]);
    const metaItemActions = React.useMemo(() => [
        {
            icon: inLibrary ? 'remove-from-library' : 'add-to-library',
            label: inLibrary ? t('REMOVE_FROM_LIB') : t('ADD_TO_LIB'),
            onClick: typeof toggleInLibrary === 'function' ? toggleInLibrary : null,
        },
        {
            icon: watched ? 'eye-off' : 'eye',
            label: watched ? t('CTX_MARK_UNWATCHED') : t('CTX_MARK_WATCHED'),
            onClick: typeof toggleWatched === 'function' ? toggleWatched : undefined,
        },
    ], [inLibrary, watched, toggleInLibrary, toggleWatched]);
    return (
        <div className={classnames(className, styles['meta-preview-container'], { [styles['compact']]: compact })} ref={ref}>
            {
                typeof background === 'string' && background.length > 0 ?
                    <div className={styles['background-image-layer']}>
                        <Image className={styles['background-image']} src={background} alt={' '} />
                    </div>
                    :
                    null
            }
            <div className={styles['meta-info-container']}>
                {
                    typeof logo === 'string' && logo.length > 0 ?
                        <Image
                            className={styles['logo']}
                            src={logo}
                            alt={' '}
                            title={name}
                            renderFallback={renderLogoFallback}
                        />
                        :
                        renderLogoFallback()
                }
                {
                    (typeof releaseInfo === 'string' && releaseInfo.length > 0) || (released instanceof Date && !isNaN(released.getTime())) || (typeof runtime === 'string' && runtime.length > 0) || linksGroups.has(CONSTANTS.IMDB_LINK_CATEGORY) ?
                        <div className={styles['runtime-release-info-container']}>
                            {
                                typeof runtime === 'string' && runtime.length > 0 ?
                                    <div className={styles['runtime-label']}>{runtime}</div>
                                    :
                                    null
                            }
                            {
                                typeof releaseInfo === 'string' && releaseInfo.length > 0 ?
                                    <div className={styles['release-info-label']}>{releaseInfo}</div>
                                    :
                                    released instanceof Date && !isNaN(released.getTime()) ?
                                        <div className={styles['release-info-label']}>{released.getFullYear()}</div>
                                        :
                                        null
                            }
                            {
                                linksGroups.has(CONSTANTS.IMDB_LINK_CATEGORY) ?
                                    <Button
                                        className={styles['imdb-button-container']}
                                        title={linksGroups.get(CONSTANTS.IMDB_LINK_CATEGORY).label}
                                        href={linksGroups.get(CONSTANTS.IMDB_LINK_CATEGORY).href}
                                        target={'_blank'}
                                        {...(compact ? { tabIndex: -1 } : null)}
                                    >
                                        <div className={styles['label']}>{linksGroups.get(CONSTANTS.IMDB_LINK_CATEGORY).label}</div>
                                        <Icon className={styles['icon']} name={'imdb'} />
                                    </Button>
                                    :
                                    null
                            }
                        </div>
                        :
                        null
                }
                {
                    compact && typeof description === 'string' && description.length > 0 ?
                        <div className={styles['description-container']}>
                            {description}
                        </div>
                        :
                        null
                }
                {
                    Array.from(linksGroups.keys())
                        .filter((category) => {
                            return category !== CONSTANTS.IMDB_LINK_CATEGORY &&
                                category !== CONSTANTS.SHARE_LINK_CATEGORY &&
                                category !== CONSTANTS.WRITERS_LINK_CATEGORY;
                        })
                        .map((category, index) => (
                            <MetaLinks
                                key={index}
                                className={styles['meta-links']}
                                label={category}
                                links={linksGroups.get(category)}
                            />
                        ))
                }
                {
                    !compact && typeof description === 'string' && description.length > 0 ?
                        <div className={styles['description-container']}>
                            <div className={styles['label-container']}>
                                {t('SUMMARY')}
                            </div>
                            {description}
                        </div>
                        :
                        null
                }
            </div>
            <div className={styles['action-buttons-container']}>
                {
                    typeof trailerHref === 'string' ?
                        <ActionButton
                            className={styles['action-button']}
                            icon={'trailer'}
                            label={t('TRAILER')}
                            tabIndex={compact ? -1 : 0}
                            href={trailerHref}
                            tooltip={compact}
                        />
                        :
                        null
                }
                {
                    typeof toggleInLibrary === 'function' && typeof toggleWatched === 'function'
                        ? <ActionsGroup items={metaItemActions} className={styles['group-container']} />
                        : null
                }
                {
                    typeof showHref === 'string' && compact ?
                        <ActionButton
                            className={classnames(styles['action-button'], styles['show-button'])}
                            icon={'play'}
                            label={t('SHOW')}
                            tabIndex={compact ? -1 : 0}
                            href={showHref}
                        />
                        :
                        null
                }
                {
                    !compact && ratingInfo !== null ?
                        <Ratings
                            ratingInfo={ratingInfo}
                            className={styles['group-container']}
                        />
                        :
                        null
                }
                {
                    linksGroups.has(CONSTANTS.SHARE_LINK_CATEGORY) && !compact ?
                        <React.Fragment>
                            <ActionButton
                                className={styles['action-button']}
                                icon={'share'}
                                label={t('CTX_SHARE')}
                                tooltip={true}
                                tabIndex={compact ? -1 : 0}
                                onClick={openShareModal}
                            />
                            {
                                shareModalOpen ?
                                    <ModalDialog title={t('CTX_SHARE')} onCloseRequest={closeShareModal}>
                                        <SharePrompt
                                            className={styles['share-prompt']}
                                            url={linksGroups.get(CONSTANTS.SHARE_LINK_CATEGORY).href}
                                        />
                                    </ModalDialog>
                                    :
                                    null
                            }
                        </React.Fragment>
                        :
                        null
                }
            </div>
        </div>
    );
});

MetaPreview.Placeholder = MetaPreviewPlaceholder;

MetaPreview.propTypes = {
    className: PropTypes.string,
    compact: PropTypes.bool,
    name: PropTypes.string,
    logo: PropTypes.string,
    background: PropTypes.string,
    runtime: PropTypes.string,
    releaseInfo: PropTypes.string,
    released: PropTypes.instanceOf(Date),
    description: PropTypes.string,
    deepLinks: PropTypes.shape({
        metaDetailsVideos: PropTypes.string,
        metaDetailsStreams: PropTypes.string,
        player: PropTypes.string
    }),
    links: PropTypes.arrayOf(PropTypes.shape({
        category: PropTypes.string,
        name: PropTypes.string,
        url: PropTypes.string
    })),
    trailerStreams: PropTypes.array,
    inLibrary: PropTypes.bool,
    toggleInLibrary: PropTypes.func,
    watched: PropTypes.bool,
    toggleWatched: PropTypes.func,
    ratingInfo: PropTypes.object,
};

module.exports = MetaPreview;
