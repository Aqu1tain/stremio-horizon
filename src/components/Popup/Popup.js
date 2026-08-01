// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { createPortal } = require('react-dom');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const FocusLock = require('react-focus-lock').default;
const { default: useRouteFocused } = require('stremio/common/useRouteFocused');
const styles = require('./styles');

const VIEWPORT_PADDING = 8;

const getAnchorElement = (element) => {
    if (element === document.documentElement) {
        return element;
    }

    const style = window.getComputedStyle(element);
    if (style.overflowY.indexOf('auto') !== -1 || style.overflowY.indexOf('scroll') !== -1) {
        return element;
    }

    return getAnchorElement(element.parentElement);
};

const Popup = ({ open, direction, portal, menuClassName, renderLabel, renderMenu, dataset, onCloseRequest, ...props }) => {
    const routeFocused = useRouteFocused();
    const labelRef = React.useRef(null);
    const menuRef = React.useRef(null);
    const [autoDirection, setAutoDirection] = React.useState(null);
    const [portalPosition, setPortalPosition] = React.useState(null);
    const menuOnMouseDown = React.useCallback((event) => {
        event.nativeEvent.closePopupPrevented = true;
    }, []);
    React.useEffect(() => {
        const onCloseEvent = (event) => {
            if (!event.closePopupPrevented && typeof onCloseRequest === 'function') {
                const closeEvent = {
                    type: 'close',
                    nativeEvent: event,
                    dataset: dataset
                };
                switch (event.type) {
                    case 'keydown':
                        if (event.code === 'Escape') {
                            onCloseRequest(closeEvent);
                        }
                        break;
                    case 'mousedown':
                        if (event.target !== document.documentElement && !labelRef.current.contains(event.target)) {
                            onCloseRequest(closeEvent);
                        }
                        break;
                    case 'pointerdown':
                        if (event.target !== document.documentElement && !labelRef.current.contains(event.target)) {
                            onCloseRequest(closeEvent);
                        }
                        break;
                }
            }
        };
        if (routeFocused && open) {
            window.addEventListener('keydown', onCloseEvent);
            window.addEventListener('mousedown', onCloseEvent);
            window.addEventListener('pointerdown', onCloseEvent);
        }
        return () => {
            window.removeEventListener('keydown', onCloseEvent);
            window.removeEventListener('mousedown', onCloseEvent);
            window.removeEventListener('pointerdown', onCloseEvent);
        };
    }, [routeFocused, open, onCloseRequest, dataset]);
    const updatePortalPosition = React.useCallback(() => {
        if (!labelRef.current || !menuRef.current) {
            return;
        }

        const labelRect = labelRef.current.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();
        const [requestedVertical, requestedHorizontal] = typeof direction === 'string' ? direction.split('-') : [];
        const availableTop = labelRect.top - VIEWPORT_PADDING;
        const availableBottom = window.innerHeight - labelRect.bottom - VIEWPORT_PADDING;
        const vertical = requestedVertical || (menuRect.height <= availableBottom || availableBottom >= availableTop ? 'bottom' : 'top');
        const horizontal = requestedHorizontal || (menuRect.width <= labelRect.right - VIEWPORT_PADDING ? 'left' : 'right');
        const preferredTop = vertical === 'top' ? labelRect.top - menuRect.height : labelRect.bottom;
        const preferredLeft = horizontal === 'left' ? labelRect.right - menuRect.width : labelRect.left;

        setPortalPosition({
            top: Math.max(VIEWPORT_PADDING, Math.min(preferredTop, window.innerHeight - menuRect.height - VIEWPORT_PADDING)),
            left: Math.max(VIEWPORT_PADDING, Math.min(preferredLeft, window.innerWidth - menuRect.width - VIEWPORT_PADDING))
        });
    }, [direction]);
    React.useLayoutEffect(() => {
        if (open && portal) {
            updatePortalPosition();
            window.addEventListener('resize', updatePortalPosition);
            window.addEventListener('scroll', updatePortalPosition, true);
            return () => {
                window.removeEventListener('resize', updatePortalPosition);
                window.removeEventListener('scroll', updatePortalPosition, true);
            };
        }

        setPortalPosition(null);
        return undefined;
    }, [open, portal, updatePortalPosition]);
    React.useLayoutEffect(() => {
        if (open && !portal) {
            const autoDirection = [];
            const anchor = getAnchorElement(labelRef.current);
            const anchorRect = anchor.getBoundingClientRect();

            const labelRect = labelRef.current.getBoundingClientRect();
            const menuRect = menuRef.current.getBoundingClientRect();
            const labelPosition = {
                left: labelRect.left - anchorRect.left,
                top: labelRect.top - anchorRect.top,
                right: (anchorRect.width + anchorRect.left) - (labelRect.left + labelRect.width),
                bottom: (anchorRect.height + anchorRect.top) - (labelRect.top + labelRect.height)
            };

            if (menuRect.height <= labelPosition.bottom) {
                autoDirection.push('bottom');
            } else if (menuRect.height <= labelPosition.top) {
                autoDirection.push('top');
            } else if (labelPosition.bottom >= labelPosition.top) {
                autoDirection.push('bottom');
            } else {
                autoDirection.push('top');
            }

            if (menuRect.width <= (labelPosition.right + labelRect.width)) {
                autoDirection.push('right');
            } else if (menuRect.width <= (labelPosition.left + labelRect.width)) {
                autoDirection.push('left');
            } else if (labelPosition.right > labelPosition.left) {
                autoDirection.push('right');
            } else {
                autoDirection.push('left');
            }

            setAutoDirection(autoDirection.join('-'));
        } else if (!portal) {
            setAutoDirection(null);
        }
    }, [open, portal]);
    const menu = open ?
        <FocusLock
            ref={menuRef}
            className={classnames(
                styles['menu-container'],
                menuClassName,
                { [styles['portal-menu-container']]: portal },
                { [styles[`menu-direction-${autoDirection}`]]: !portal && !direction },
                { [styles[`menu-direction-${direction}`]]: !portal && direction }
            )}
            autoFocus={false}
            lockProps={{
                onMouseDown: menuOnMouseDown,
                style: portal ? { ...portalPosition, visibility: portalPosition ? 'visible' : 'hidden' } : undefined
            }}
        >
            {renderMenu()}
        </FocusLock>
        :
        null;
    const label = renderLabel({
        ...props,
        ref: labelRef,
        className: classnames(styles['label-container'], props.className, { 'active': open }),
        children: portal ? null : menu
    });
    return portal && menu ?
        <React.Fragment>
            {label}
            {createPortal(menu, document.body)}
        </React.Fragment>
        :
        label;
};

Popup.propTypes = {
    className: PropTypes.string,
    open: PropTypes.bool,
    direction: PropTypes.oneOf(['top-left', 'bottom-left', 'top-right', 'bottom-right']),
    portal: PropTypes.bool,
    menuClassName: PropTypes.string,
    renderLabel: PropTypes.func.isRequired,
    renderMenu: PropTypes.func.isRequired,
    dataset: PropTypes.object,
    onCloseRequest: PropTypes.func
};

module.exports = Popup;
