// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { Button, Image } = require('stremio/components');
const { default: useFullscreen } = require('stremio/common/useFullscreen');
const usePWA = require('stremio/common/usePWA');
const SearchBar = require('./SearchBar');
const NavMenu = require('./NavMenu');
const styles = require('./styles');
const { t } = require('i18next');

const HorizontalNavBar = React.memo(({ className, route, query, title, backButton, searchBar, fullscreenButton, navMenu, tabs, selected, navbarHidden, navbarScrolled, ...props }) => {
    const backButtonOnClick = React.useCallback(() => {
        window.history.back();
    }, []);
    const [fullscreen, requestFullscreen, exitFullscreen] = useFullscreen();
    const [isIOSPWA] = usePWA();
    const renderNavMenuLabel = React.useCallback(({ ref, className, onClick, children, }) => (
        <Button ref={ref} className={classnames(className, styles['button-container'], styles['menu-button-container'])} tabIndex={-1} onClick={onClick}>
            <Icon className={styles['icon']} name={'person-outline'} />
            {children}
        </Button>
    ), []);
    const showSearchIcon = searchBar && route !== 'addons';
    const showFullscreen = !isIOSPWA && fullscreenButton;
    const hasTabs = Array.isArray(tabs) && tabs.length > 0;

    return (
        <nav {...props} className={classnames(className, styles['horizontal-nav-bar-container'], {
            [styles['navbar-hidden']]: navbarHidden,
            [styles['navbar-scrolled']]: navbarScrolled,
        })}>
            {hasTabs &&
                <div className={styles['nav-tabs-container']}>
                    <Image
                        className={styles['nav-logo']}
                        src={require('/assets/images/stremio_symbol.png')}
                        alt={' '}
                    />
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            className={classnames(styles['nav-tab'], { [styles['nav-tab-active']]: tab.id === selected })}
                            href={tab.href}
                            tabIndex={-1}
                        >
                            {t(tab.label)}
                        </Button>
                    ))}
                </div>
            }
            {backButton &&
                <Button className={classnames(styles['button-container'], styles['back-button-container'])} tabIndex={-1} onClick={backButtonOnClick}>
                    <Icon className={styles['icon']} name={'chevron-back'} />
                </Button>
            }
            {title &&
                <h2 className={styles['title']}>{title}</h2>
            }
            <div className={styles['buttons-container']}>
                {showSearchIcon && <SearchBar query={query} active={false} />}
                {showFullscreen &&
                    <Button className={styles['button-container']} title={fullscreen ? t('EXIT_FULLSCREEN') : t('ENTER_FULLSCREEN')} tabIndex={-1} onClick={fullscreen ? exitFullscreen : requestFullscreen}>
                        <Icon className={styles['icon']} name={fullscreen ? 'minimize' : 'maximize'} />
                    </Button>
                }
                {navMenu && <NavMenu renderLabel={renderNavMenuLabel} />}
            </div>
        </nav>
    );
});

HorizontalNavBar.displayName = 'HorizontalNavBar';

HorizontalNavBar.propTypes = {
    className: PropTypes.string,
    route: PropTypes.string,
    query: PropTypes.string,
    title: PropTypes.string,
    backButton: PropTypes.bool,
    searchBar: PropTypes.bool,
    fullscreenButton: PropTypes.bool,
    navMenu: PropTypes.bool,
    tabs: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        label: PropTypes.string,
        href: PropTypes.string,
    })),
    selected: PropTypes.string,
    navbarHidden: PropTypes.bool,
    navbarScrolled: PropTypes.bool,
};

module.exports = HorizontalNavBar;
