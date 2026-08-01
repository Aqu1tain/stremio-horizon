// Copyright (C) 2017-2023 Smart code 203358507

import React, { memo, useRef } from 'react';
import classnames from 'classnames';
import { VerticalNavBar, HorizontalNavBar } from 'stremio/components/NavBar';
import useNavbarScroll from 'stremio/common/useNavbarScroll';
import { useContentGamepadNavigation, useVerticalNavGamepadNavigation } from 'stremio/services/GamepadNavigation';
import { isTauri } from 'stremio/lib/tauri-events';
const SearchBar = require('stremio/components/NavBar/HorizontalNavBar/SearchBar');
import styles from './MainNavBars.less';

const TABS = [
    { id: 'board', label: 'WEBSITE_PAGE_HOME', icon: 'home', href: '/' },
    { id: 'discover', label: 'Discover', icon: 'discover', href: '/discover' },
    { id: 'library', label: 'Library', icon: 'library', href: '/library' },
    { id: 'downloads', label: 'DOWNLOADS', icon: 'download', href: '/downloads', desktopOnly: true },
    { id: 'calendar', label: 'Calendar', icon: 'calendar', href: '/calendar' },
    { id: 'addons', label: 'WEBSITE_PAGE_ADDONS', icon: 'addons', href: '/addons' },
    { id: 'settings', label: 'SETTINGS', icon: 'settings', href: '/settings' },
];

type Props = {
    className: string,
    route?: string,
    query?: string,
    overlay?: boolean,
    children?: React.ReactNode,
};

const MainNavBars = memo(({ className, route, query, overlay, children }: Props) => {
    const navRef = useRef(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const autoHide = route === 'board' || route === 'metadetails';
    const { visible, scrolled } = useNavbarScroll(contentRef, autoHide);
    const tabs = TABS.filter((tab) => !tab.desktopOnly || isTauri());
    const topNavTabs = tabs.filter((tab) => tab.id !== 'settings');

    const navRoute = route === 'continue_watching' ? 'library' : (route ?? '');
    useContentGamepadNavigation(contentRef, navRoute);
    useVerticalNavGamepadNavigation(navRef, navRoute);

    return (
        <div className={classnames(className, styles['main-nav-bars-container'], { [styles['overlay']]: overlay })}>
            <HorizontalNavBar
                className={styles['horizontal-nav-bar']}
                route={route}
                query={query}
                backButton={false}
                searchBar={true}
                navMenu={true}
                tabs={topNavTabs}
                selected={route}
                navbarHidden={autoHide && !visible}
                navbarScrolled={scrolled || route === 'search'}
            />
            {route === 'search' &&
                <div className={styles['search-bar-row']}>
                    <SearchBar className={styles['search-bar-input']} query={query} active={true} />
                </div>
            }
            <VerticalNavBar
                ref={navRef}
                className={styles['vertical-nav-bar']}
                selected={route}
                tabs={tabs}
            />
            <div ref={contentRef} className={classnames(styles['nav-content-container'], { [styles['search-active']]: route === 'search' })}>{children}</div>
        </div>
    );
});

export default MainNavBars;
