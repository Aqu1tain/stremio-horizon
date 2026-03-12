import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'stremio/components';
import Icon from 'stremio/components/Icon';
import { useServices } from 'stremio/services';
import { Option, Section } from '../components';
import styles from './Info.less';

type Props = {
    streamingServer: StreamingServer,
};

const Info = ({ streamingServer }: Props) => {
    const { shell } = useServices();
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const settings = useMemo(() => (
        streamingServer?.settings?.type === 'Ready' ?
            streamingServer.settings.content as StreamingServerSettings : null
    ), [streamingServer?.settings]);

    const onCopyHash = useCallback(() => {
        navigator.clipboard.writeText(process.env.COMMIT_HASH ?? '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, []);

    return (
        <Section className={styles['info']} label={'SETTINGS_ABOUT'}>
            <Option label={'Stremio Horizon'}>
                <div className={styles['label']}>
                    {process.env.VERSION}
                </div>
            </Option>
            {
                typeof shell?.transport?.props?.shellVersion === 'string' &&
                    <Option label={'Stremio Horizon App'}>
                        <div className={styles['label']}>
                            {shell.transport.props.shellVersion}
                        </div>
                    </Option>
            }
            <Option label={'Stremio Core'}>
                <div className={styles['label']}>
                    {process.env.CORE_VERSION}
                </div>
            </Option>
            {
                settings?.serverVersion &&
                    <Option label={t('SETTINGS_SERVER_VERSION')}>
                        <div className={styles['label']}>
                            {settings.serverVersion}
                        </div>
                    </Option>
            }
            <Option label={t('SETTINGS_BUILD_VERSION')}>
                <div className={styles['option-content']}>
                    <div className={styles['label']}>
                        {process.env.COMMIT_HASH}
                    </div>
                    <Button className={styles['copy-button']} title={t('COPY')} onClick={onCopyHash}>
                        <Icon className={styles['copy-icon']} name={copied ? 'checkmark' : 'copy'} />
                    </Button>
                </div>
            </Option>
        </Section>
    );
};

export default Info;
