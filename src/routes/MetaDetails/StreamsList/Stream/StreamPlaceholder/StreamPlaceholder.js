// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const PlayIconCircleCentered = require('./PlayIconCircleCentered');
const styles = require('./styles');

const StreamPlaceholder = ({ className, addonName }) => {
    const hasAddonName = typeof addonName === 'string' && addonName.length > 0;

    return (
        <div className={classnames(className, styles['stream-placeholder-container'])}>
            <div className={styles['addon-container']}>
                <div
                    className={classnames(styles['addon-name'], { [styles['addon-name-placeholder']]: !hasAddonName })}
                    title={hasAddonName ? addonName : undefined}
                >
                    {hasAddonName ? addonName : null}
                </div>
            </div>
            <div className={styles['info-container']}>
                <div className={styles['description-container']} />
                <div className={styles['description-container']} />
            </div>
            <PlayIconCircleCentered className={styles['play-icon']} />
        </div>
    );
};

StreamPlaceholder.propTypes = {
    className: PropTypes.string,
    addonName: PropTypes.string
};

module.exports = StreamPlaceholder;
