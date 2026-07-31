// Copyright (C) 2017-2025 Smart code 203358507

import React, { useCallback, ChangeEvent, RefCallback } from 'react';
import classNames from 'classnames';
import styles from './Checkbox.less';
import Button from '../Button';
import Icon from 'stremio/components/Icon';

type Props = {
    ref?: RefCallback<HTMLInputElement>;
    name: string;
    disabled?: boolean;
    checked?: boolean;
    className?: string;
    label?: string;
    link?: string;
    href?: string;
    onChange?: (props: {
        type: string;
        checked: boolean;
        reactEvent: ChangeEvent<HTMLInputElement>;
        nativeEvent: Event;
    }) => void;
    error?: string;
};

const Checkbox = React.forwardRef<HTMLInputElement, Props>(({ name, disabled, className, label, href, link, onChange, error, checked }, ref) => {

    const handleSelect = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        if (!disabled && onChange) {
            onChange({
                type: 'select',
                checked: event.target.checked,
                reactEvent: event,
                nativeEvent: event.nativeEvent,
            });
        }
    }, [disabled, onChange]);

    return (
        <div className={classNames(styles['checkbox'], className)}>
            <label className={styles['label']} htmlFor={name}>
                <div
                    className={classNames(
                        styles['checkbox-container'],
                        { [styles['checked']]: checked },
                        { [styles['disabled']]: disabled },
                        { [styles['error']]: error }
                    )}
                >
                    <input
                        ref={ref}
                        id={name}
                        name={name}
                        type={'checkbox'}
                        checked={checked}
                        disabled={disabled}
                        onChange={handleSelect}
                        className={styles['input']}
                    />
                    {
                        checked ?
                            <Icon name={'checkmark'} className={styles['checkbox-icon']} />
                            : null
                    }
                </div>
                <div>
                    <span>{label}{href && link ? ' ' : null}</span>
                    {
                        href && link ?
                            <Button className={styles['link']} href={href} target={'_blank'}>
                                {link}
                            </Button>
                            : null
                    }
                </div>
            </label>
        </div>
    );
});

export default Checkbox;
