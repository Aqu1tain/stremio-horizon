// Copyright (C) 2017-2023 Smart code 203358507

import React, { memo, useRef } from 'react';
import classnames from 'classnames';
import { VerticalNavBar, HorizontalNavBar } from 'stremio/components/NavBar';
const { useNavbarScroll } = require('stremio/common');
import styles from './MainNavBars.less';

const TABS = [
    { id: 'board', label: 'Home', icon: 'home', href: '#/' },
    { id: 'discover', label: 'Discover', icon: 'discover', href: '#/discover' },
    { id: 'library', label: 'Library', icon: 'library', href: '#/library' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar', href: '#/calendar' },
    { id: 'addons', label: 'ADDONS', icon: 'addons', href: '#/addons' },
    { id: 'settings', label: 'SETTINGS', icon: 'settings', href: '#/settings' },
];

const TOP_NAV_TABS = TABS.filter((tab) => tab.id !== 'settings');

type Props = {
    className: string,
    route?: string,
    query?: string,
    overlay?: boolean,
    children?: React.ReactNode,
};

const MainNavBars = memo(({ className, route, query, overlay, children }: Props) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const { visible, scrolled } = useNavbarScroll(contentRef);

    return (
        <div className={classnames(className, styles['main-nav-bars-container'], { [styles['overlay']]: overlay })}>
            <HorizontalNavBar
                className={styles['horizontal-nav-bar']}
                route={route}
                query={query}
                backButton={false}
                searchBar={true}
                fullscreenButton={true}
                navMenu={true}
                tabs={TOP_NAV_TABS}
                selected={route}
                navbarHidden={!visible}
                navbarScrolled={scrolled}
            />
            <VerticalNavBar
                className={styles['vertical-nav-bar']}
                selected={route}
                tabs={TABS}
            />
            <div ref={contentRef} className={styles['nav-content-container']}>{children}</div>
        </div>
    );
});

export default MainNavBars;

