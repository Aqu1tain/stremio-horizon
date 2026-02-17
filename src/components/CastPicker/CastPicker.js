// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const classnames = require('classnames');
const { useTranslation } = require('react-i18next');
const { useServices } = require('stremio/services');
const { ModalDialog } = require('stremio/components');
const { default: Button } = require('stremio/components/Button');
const { default: Icon } = require('stremio/components/Icon');
const styles = require('./styles');

const CastPicker = () => {
    const { t } = useTranslation();
    const { chromecast } = useServices();
    const [open, setOpen] = React.useState(false);
    const [devices, setDevices] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [connecting, setConnecting] = React.useState(null);
    const [error, setError] = React.useState(null);

    const discover = React.useCallback(() => {
        if (!chromecast.active || !chromecast.transport.discover) return;

        setLoading(true);
        setError(null);
        setDevices([]);

        chromecast.transport.discover()
            .then((found) => {
                setDevices(found || []);
                setLoading(false);
            })
            .catch((err) => {
                setError(String(err));
                setLoading(false);
            });
    }, [chromecast.active]);

    const onDeviceSelect = React.useCallback((device) => {
        if (!chromecast.active) return;

        setConnecting(device.name);
        chromecast.transport.connectAndLaunch(device.host, device.port, device.name)
            .then(() => {
                setOpen(false);
                setConnecting(null);
            })
            .catch((err) => {
                setError(String(err));
                setConnecting(null);
            });
    }, [chromecast.active]);

    const onClose = React.useCallback(() => {
        setOpen(false);
        setConnecting(null);
        setError(null);
    }, []);

    React.useEffect(() => {
        if (!chromecast.active || !chromecast.transport) return;

        const onSessionRequest = () => setOpen(true);
        chromecast.transport.on('session-request', onSessionRequest);
        return () => chromecast.transport.off('session-request', onSessionRequest);
    }, [chromecast.active, chromecast.transport]);

    React.useEffect(() => {
        if (open) discover();
    }, [open]);

    if (!open) return null;

    return (
        <ModalDialog
            className={styles['cast-picker-modal']}
            title={t('CAST_TO')}
            onCloseRequest={onClose}
        >
            <div className={styles['cast-picker-content']}>
                {loading && !connecting && (
                    <div className={styles['status-message']}>
                        {t('CAST_SEARCHING_DEVICES')}
                    </div>
                )}
                {connecting && (
                    <div className={styles['status-message']}>
                        {t('CAST_CONNECTING_TO', { name: connecting })}
                    </div>
                )}
                {error && (
                    <div className={classnames(styles['status-message'], styles['error'])}>
                        {error}
                    </div>
                )}
                {!loading && !connecting && devices.length === 0 && !error && (
                    <div className={styles['status-message']}>
                        {t('CAST_NO_DEVICES_FOUND')}
                    </div>
                )}
                {!connecting && devices.length > 0 && (
                    <div className={styles['device-list']}>
                        {devices.map((device) => (
                            <Button
                                key={`${device.host}:${device.port}`}
                                className={styles['device-item']}
                                onClick={() => onDeviceSelect(device)}
                            >
                                <Icon className={styles['device-icon']} name={'cast'} />
                                <div className={styles['device-name']}>{device.name}</div>
                            </Button>
                        ))}
                    </div>
                )}
                {!loading && !connecting && (
                    <Button className={styles['refresh-button']} onClick={discover}>
                        <Icon className={styles['refresh-icon']} name={'reset'} />
                        <div className={styles['refresh-label']}>{t('CAST_SCAN_AGAIN')}</div>
                    </Button>
                )}
            </div>
        </ModalDialog>
    );
};

module.exports = CastPicker;
