// Copyright (C) 2017-2026 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const { useTranslation } = require('react-i18next');
const { default: Button } = require('stremio/components/Button');
const { default: MainNavBars } = require('stremio/components/MainNavBars');
const styles = require('./RouteLoading.less');

const getLoadingPresentation = (pathname = '/') => {
    if (pathname.startsWith('/intro')) return { kind: 'auth', route: null };
    if (pathname.startsWith('/player')) return { kind: 'player', route: null };
    if (pathname.startsWith('/discover')) return { kind: 'grid', route: 'discover' };
    if (pathname.startsWith('/library')) return { kind: 'grid', route: 'library' };
    if (pathname.startsWith('/continuewatching')) return { kind: 'grid', route: 'continue_watching' };
    if (pathname.startsWith('/calendar')) return { kind: 'calendar', route: 'calendar' };
    if (pathname.startsWith('/addons')) return { kind: 'addons', route: 'addons' };
    if (pathname.startsWith('/settings')) return { kind: 'settings', route: 'settings' };
    if (pathname.startsWith('/search')) return { kind: 'rows', route: 'search' };
    if (pathname.startsWith('/metadetails') || pathname.startsWith('/detail')) return { kind: 'details', route: 'metadetails' };
    return { kind: 'board', route: 'board' };
};

const Skeleton = ({ kind }) => {
    switch (kind) {
        case 'auth':
            return (
                <div className={styles['auth-skeleton']}>
                    <div className={styles['brand-mark']} />
                    <div className={styles['wide-line']} />
                    <div className={styles['field']} />
                    <div className={styles['field']} />
                    <div className={styles['primary-button']} />
                </div>
            );
        case 'player':
            return <div className={styles['player-spinner']} />;
        case 'calendar':
            return (
                <div className={styles['calendar-skeleton']}>
                    <div className={styles['toolbar']} />
                    <div className={styles['calendar-grid']}>
                        {Array.from({ length: 35 }).map((_, index) => <div key={index} className={styles['calendar-cell']} />)}
                    </div>
                </div>
            );
        case 'addons':
            return (
                <div className={styles['addons-skeleton']}>
                    <div className={styles['controls']}>
                        <div /><div /><span /><div />
                    </div>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className={styles['addon-row']}>
                            <div className={styles['addon-logo']} />
                            <div className={styles['addon-copy']}><div /><div /><div /></div>
                            <div className={styles['addon-actions']}><div /><div /></div>
                        </div>
                    ))}
                </div>
            );
        case 'settings':
            return (
                <div className={styles['settings-skeleton']}>
                    <div className={styles['settings-menu']}>{Array.from({ length: 6 }).map((_, index) => <div key={index} />)}</div>
                    <div className={styles['settings-sections']}>{Array.from({ length: 4 }).map((_, index) => <div key={index} />)}</div>
                </div>
            );
        case 'details':
            return (
                <div className={styles['details-skeleton']}>
                    <div className={styles['details-poster']} />
                    <div className={styles['details-copy']}><div /><div /><div /><div /></div>
                </div>
            );
        case 'rows':
            return (
                <div className={styles['rows-skeleton']}>
                    {Array.from({ length: 3 }).map((_, rowIndex) => (
                        <div key={rowIndex} className={styles['skeleton-row']}>
                            <div className={styles['row-title']} />
                            <div className={styles['posters']}>{Array.from({ length: 7 }).map((_, index) => <div key={index} />)}</div>
                        </div>
                    ))}
                </div>
            );
        case 'grid':
            return (
                <div className={styles['grid-skeleton']}>
                    <div className={styles['controls']}><div /><div /><div /></div>
                    <div className={styles['poster-grid']}>{Array.from({ length: 24 }).map((_, index) => <div key={index} />)}</div>
                </div>
            );
        default:
            return (
                <div className={styles['board-skeleton']}>
                    <div className={styles['hero']} />
                    <div className={styles['row-title']} />
                    <div className={styles['posters']}>{Array.from({ length: 7 }).map((_, index) => <div key={index} />)}</div>
                </div>
            );
    }
};

Skeleton.propTypes = {
    kind: PropTypes.string.isRequired,
};

const RouteLoadingContent = ({ kind, error, onRetry, onHome }) => {
    const { t } = useTranslation();

    return (
        <div
            className={styles['loading-content']}
            role={error ? 'alert' : 'status'}
            aria-live={'polite'}
            aria-busy={!error}
        >
            {
                error ?
                    <div className={styles['error-card']}>
                        <div className={styles['error-title']}>{t('GENERIC_ERROR_MESSAGE')}</div>
                        <div className={styles['error-actions']}>
                            <Button className={styles['retry-button']} onClick={onRetry}>{t('TRY_AGAIN')}</Button>
                            <Button className={styles['home-button']} onClick={onHome}>{t('WEBSITE_GO_HOME')}</Button>
                        </div>
                    </div>
                    :
                    <>
                        <span className={styles['visually-hidden']}>{t('STREAM_LOADING')}</span>
                        <Skeleton kind={kind} />
                    </>
            }
        </div>
    );
};

RouteLoadingContent.propTypes = {
    kind: PropTypes.string.isRequired,
    error: PropTypes.bool,
    onRetry: PropTypes.func,
    onHome: PropTypes.func,
};

const RouteLoading = ({ pathname, error, onRetry, onHome }) => {
    const { kind, route } = getLoadingPresentation(pathname);
    const content = <RouteLoadingContent kind={kind} error={error} onRetry={onRetry} onHome={onHome} />;

    return route === null ?
        <div className={styles['standalone-shell']}>{content}</div>
        :
        <MainNavBars className={styles['navigation-shell']} route={route} overlay={route === 'board'}>
            {content}
        </MainNavBars>;
};

RouteLoading.propTypes = {
    pathname: PropTypes.string.isRequired,
    error: PropTypes.bool,
    onRetry: PropTypes.func,
    onHome: PropTypes.func,
};

module.exports = { RouteLoading, RouteLoadingContent, getLoadingPresentation };
