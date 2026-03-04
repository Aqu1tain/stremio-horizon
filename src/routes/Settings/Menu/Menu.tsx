import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button } from 'stremio/components';
import Icon from 'stremio/components/Icon';
import { SECTIONS } from '../constants';
import styles from './Menu.less';

type Props = {
    selected: string,
    onSelect: (event: React.MouseEvent<HTMLDivElement>) => void,
};

const MENU_ITEMS = [
    { section: SECTIONS.GENERAL, label: 'SETTINGS_NAV_GENERAL', icon: 'settings' },
    { section: SECTIONS.INTERFACE, label: 'INTERFACE', icon: 'eye' },
    { section: SECTIONS.PLAYER, label: 'SETTINGS_NAV_PLAYER', icon: 'play' },
    { section: SECTIONS.STREAMING, label: 'SETTINGS_NAV_STREAMING', icon: 'network' },
    { section: SECTIONS.SHORTCUTS, label: 'SETTINGS_NAV_SHORTCUTS', icon: 'keyboard' },
];

const Menu = ({ selected, onSelect }: Props) => {
    const { t } = useTranslation();

    return (
        <div className={styles['menu']}>
            {MENU_ITEMS.map(({ section, label, icon }) => (
                <Button
                    key={section}
                    className={classNames(styles['button'], { [styles['selected']]: selected === section })}
                    title={t(label)}
                    data-section={section}
                    onClick={onSelect}
                >
                    <Icon className={styles['icon']} name={icon} />
                    {t(label)}
                </Button>
            ))}
        </div>
    );
};

export default Menu;
