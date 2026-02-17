// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useTranslation } = require('react-i18next');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('stremio/components/Icon');
const { default: Image } = require('stremio/components/Image');
const { default: Button } = require('stremio/components/Button');
const styles = require('./styles');

const AddonDetails = ({ className, id, name, version, logo, description, types, transportUrl, official }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = React.useState(false);
    const onCopyUrl = React.useCallback(() => {
        navigator.clipboard.writeText(transportUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [transportUrl]);
    const renderLogoFallback = React.useCallback(() => (
        <Icon className={styles['icon']} name={'addons'} />
    ), []);
    return (
        <div className={classnames(className, styles['addon-details-container'])}>
            <div className={styles['title-container']}>
                <Image
                    className={styles['logo']}
                    src={logo}
                    alt={' '}
                    renderFallback={renderLogoFallback}
                />
                <div className={styles['name-container']}>
                    <span className={styles['name']}>{typeof name === 'string' && name.length > 0 ? name : id}</span>
                    {
                        typeof version === 'string' && version.length > 0 ?
                            <span className={styles['version']}>{t('ADDON_VERSION_SHORT', {version})}</span>
                            :
                            null
                    }
                </div>
            </div>
            {
                typeof description === 'string' && description.length > 0 ?
                    <div className={styles['section-container']}>
                        <span className={styles['section-label']}>{description}</span>
                    </div>
                    :
                    null
            }
            {
                typeof transportUrl === 'string' && transportUrl.length > 0 ?
                    <div className={styles['section-container']}>
                        <div className={styles['url-row']}>
                            <span className={styles['section-header']}>{`${t('URL')}:`}</span>
                            <Button className={styles['copy-button']} title={'Copy URL'} onClick={onCopyUrl}>
                                <Icon className={styles['copy-icon']} name={copied ? 'checkmark' : 'copy'} />
                            </Button>
                        </div>
                        <span className={classnames(styles['section-label'], styles['transport-url-label'])} title={transportUrl}>{transportUrl}</span>
                    </div>
                    :
                    null
            }
            {
                Array.isArray(types) && types.length > 0 ?
                    <div className={styles['section-container']}>
                        <span className={styles['section-header']}>{`${t('ADDON_SUPPORTED_TYPES')}:`} </span>
                        <span className={styles['section-label']}>
                            {
                                types.length === 1 ?
                                    types[0]
                                    :
                                    types.slice(0, -1).join(', ') + ' & ' + types[types.length - 1]
                            }
                        </span>
                    </div>
                    :
                    null
            }
            {
                !official ?
                    <div className={styles['section-container']}>
                        <div className={classnames(styles['section-label'], styles['disclaimer-label'])}>{t('ADDON_DISCLAIMER')}</div>
                    </div>
                    :
                    null
            }
        </div>
    );
};

AddonDetails.propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    version: PropTypes.string,
    logo: PropTypes.string,
    description: PropTypes.string,
    types: PropTypes.arrayOf(PropTypes.string),
    transportUrl: PropTypes.string,
    official: PropTypes.bool,
};

module.exports = AddonDetails;
