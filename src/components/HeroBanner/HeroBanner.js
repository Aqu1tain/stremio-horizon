// Copyright (C) 2017-2025 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { default: Button } = require('stremio/components/Button');
const HeroBannerItem = require('./HeroBannerItem');
const HeroBannerPlaceholder = require('./HeroBannerPlaceholder');
const styles = require('./styles');

const AUTO_ROTATE_INTERVAL = 7000;
const PAUSE_AFTER_INTERACTION = 12000;

const HeroBanner = ({ className, items }) => {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const count = items.length;
    const intervalRef = React.useRef(null);
    const pauseTimeoutRef = React.useRef(null);

    const startAutoRotation = React.useCallback(() => {
        if (count <= 1) return;
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % count);
        }, AUTO_ROTATE_INTERVAL);
    }, [count]);

    const pauseAndRestart = React.useCallback(() => {
        clearInterval(intervalRef.current);
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = setTimeout(startAutoRotation, PAUSE_AFTER_INTERACTION);
    }, [startAutoRotation]);

    React.useEffect(() => {
        startAutoRotation();
        return () => {
            clearInterval(intervalRef.current);
            clearTimeout(pauseTimeoutRef.current);
        };
    }, [startAutoRotation]);

    const goToPrev = React.useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + count) % count);
        pauseAndRestart();
    }, [count, pauseAndRestart]);

    const goToNext = React.useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % count);
        pauseAndRestart();
    }, [count, pauseAndRestart]);

    const goToIndex = React.useCallback((index) => {
        setActiveIndex(index);
        pauseAndRestart();
    }, [pauseAndRestart]);

    const activeItem = items[activeIndex];
    if (!activeItem) return null;

    return (
        <div className={classnames(className, styles['hero-banner-container'])}>
            <HeroBannerItem
                key={activeIndex}
                className={'animation-fade-in'}
                id={activeItem.id}
                name={activeItem.name}
                description={activeItem.description}
                releaseInfo={activeItem.releaseInfo}
                runtime={activeItem.runtime}
                links={activeItem.links}
                deepLinks={activeItem.deepLinks}
                trailerStreams={activeItem.trailerStreams}
                background={activeItem.background}
                logo={activeItem.logo}
                poster={activeItem.poster}
            />
            {
                count > 1 ?
                    <div className={styles['navigation-layer']}>
                        <Button className={styles['nav-arrow']} onClick={goToPrev}>
                            <Icon className={styles['icon']} name={'chevron-back'} />
                        </Button>
                        <div className={styles['dots-container']}>
                            {items.map((_, index) => (
                                <button
                                    key={index}
                                    className={classnames(styles['dot'], { [styles['active']]: index === activeIndex })}
                                    onClick={() => goToIndex(index)}
                                />
                            ))}
                        </div>
                        <Button className={styles['nav-arrow']} onClick={goToNext}>
                            <Icon className={styles['icon']} name={'chevron-forward'} />
                        </Button>
                    </div>
                    :
                    null
            }
        </div>
    );
};

HeroBanner.Placeholder = HeroBannerPlaceholder;

HeroBanner.propTypes = {
    className: PropTypes.string,
    items: PropTypes.array.isRequired,
};

module.exports = HeroBanner;
