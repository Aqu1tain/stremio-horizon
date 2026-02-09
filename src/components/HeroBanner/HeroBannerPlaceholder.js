// Copyright (C) 2017-2025 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const styles = require('./styles');

const HeroBannerPlaceholder = ({ className }) => {
    return (
        <div className={classnames(className, styles['hero-banner-placeholder'])}>
            <div className={styles['placeholder-logo']} />
            <div className={styles['placeholder-meta']} />
            <div className={styles['placeholder-description']} />
            <div className={styles['placeholder-buttons']}>
                <div className={styles['placeholder-button']} />
                <div className={styles['placeholder-button']} />
            </div>
        </div>
    );
};

HeroBannerPlaceholder.propTypes = {
    className: PropTypes.string,
};

module.exports = HeroBannerPlaceholder;
