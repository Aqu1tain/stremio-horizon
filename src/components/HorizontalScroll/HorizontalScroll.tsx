// Copyright (C) 2017-2024 Smart code 203358507

import React, { useRef, useEffect, useState, useCallback } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Icon from 'stremio/components/Icon';
import styles from './HorizontalScroll.less';

const SCROLL_THRESHOLD = 1;

type Props = {
    className: string,
    children: React.ReactNode,
    controls?: boolean,
};

const HorizontalScroll = ({ className, children, controls = false }: Props) => {
    const { t } = useTranslation();
    const ref = useRef<HTMLDivElement>(null);
    const [scrollPosition, setScrollPosition] = useState('none');

    const updateScrollPosition = useCallback(() => {
        const element = ref.current;
        if (!element) return;

        const { scrollLeft, scrollWidth, clientWidth } = element;
        const computedStyle = window.getComputedStyle(element);
        const startInset = Number.parseFloat(computedStyle.paddingLeft) || 0;
        const endInset = Number.parseFloat(computedStyle.paddingRight) || 0;
        const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);
        setScrollPosition(
            maxScrollLeft <= SCROLL_THRESHOLD ? 'none' :
                scrollLeft <= startInset + SCROLL_THRESHOLD ? 'left' :
                    (maxScrollLeft - scrollLeft) <= endInset + SCROLL_THRESHOLD ? 'right' :
                        'center'
        );
    }, []);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        updateScrollPosition();
        element.addEventListener('scroll', updateScrollPosition, { passive: true });
        window.addEventListener('resize', updateScrollPosition);
        const resizeObserver = typeof ResizeObserver === 'function'
            ? new ResizeObserver(updateScrollPosition)
            : null;
        resizeObserver?.observe(element);

        return () => {
            element.removeEventListener('scroll', updateScrollPosition);
            window.removeEventListener('resize', updateScrollPosition);
            resizeObserver?.disconnect();
        };
    }, [children, updateScrollPosition]);

    const scrollPage = useCallback((direction: -1 | 1) => {
        const element = ref.current;
        if (!element) return;
        element.scrollBy({
            left: direction * Math.max(240, element.offsetWidth * 0.85),
            behavior: 'smooth',
        });
    }, []);

    return (
        <div className={styles['horizontal-scroll-wrapper']}>
            <div ref={ref} className={classNames(styles['horizontal-scroll'], className, [styles[scrollPosition]])}>
                {children}
            </div>
            {
                controls && scrollPosition !== 'left' && scrollPosition !== 'none' ?
                    <button
                        type={'button'}
                        className={classNames(styles['scroll-control'], styles['left-control'])}
                        title={t('HORIZON_SCROLL_PREVIOUS')}
                        aria-label={t('HORIZON_SCROLL_PREVIOUS')}
                        onClick={() => scrollPage(-1)}
                    >
                        <Icon className={styles['icon']} name={'chevron-back'} />
                    </button>
                    :
                    null
            }
            {
                controls && scrollPosition !== 'right' && scrollPosition !== 'none' ?
                    <button
                        type={'button'}
                        className={classNames(styles['scroll-control'], styles['right-control'])}
                        title={t('HORIZON_SCROLL_NEXT')}
                        aria-label={t('HORIZON_SCROLL_NEXT')}
                        onClick={() => scrollPage(1)}
                    >
                        <Icon className={styles['icon']} name={'chevron-forward'} />
                    </button>
                    :
                    null
            }
        </div>
    );
};

export default HorizontalScroll;
