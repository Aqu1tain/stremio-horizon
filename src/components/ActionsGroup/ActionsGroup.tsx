// Copyright (C) 2017-2025 Smart code 203358507

import classNames from 'classnames';
import React from 'react';
import { Tooltip } from 'stremio/common/Tooltips';
import styles from './ActionsGroup.less';

const Icon = React.lazy(() => import(
    /* webpackChunkName: "legacy-icons" */
    '@stremio/stremio-icons/react'
).then((module) => ({ default: module.default })));

type Item = {
    icon: string;
    label?: string;
    filled?: string;
    disabled?: boolean;
    className?: string;
    onClick?: () => void;
};

type Props = {
    items: Item[];
    className?: string;
};

const ActionsGroup = ({ items, className }: Props) => {
    return (
        <div className={classNames(styles['group-container'], className)}>
            {
                items.map((item, index) => (
                    <div
                        key={index}
                        className={classNames(styles['icon-container'], item.className, { [styles['disabled']]: item.disabled })}
                        tabIndex={0}
                        onClick={item.onClick}
                    >
                        {
                            item.label &&
                                <Tooltip label={item.label} position={'top'} />
                        }
                        <React.Suspense fallback={null}>
                            <Icon name={item.icon} className={styles['icon']} />
                        </React.Suspense>
                    </div>
                ))
            }
        </div>
    );
};

export default ActionsGroup;
