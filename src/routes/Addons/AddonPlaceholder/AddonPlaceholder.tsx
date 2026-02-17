import React from 'react';
import classnames from 'classnames';
import styles from './AddonPlaceholder.less';

type Props = {
    className?: string;
};

export const AddonPlaceholder = ({ className }: Props) => {
    return (
        <div className={classnames(className, styles['addon-container'])}>
            <div className={styles['logo-container']}>
                <div className={styles['placeholder-logo']} />
            </div>
            <div className={styles['info-container']}>
                <div className={styles['placeholder-pill']} />
                <div className={styles['placeholder-pill']} />
                <div className={styles['placeholder-pill']} />
            </div>
            <div className={styles['buttons-container']}>
                <div className={styles['placeholder-pill']} />
            </div>
        </div>
    );
};
