const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const CONSTANTS = require('stremio/common/CONSTANTS');
const MetaLinks = require('stremio/components/MetaPreview/MetaLinks');
const styles = require('./styles');

const DetailsPanel = ({ className, description, linksGroups }) => {
    const categories = React.useMemo(() => {
        return Array.from(linksGroups.keys()).filter((category) =>
            category !== CONSTANTS.IMDB_LINK_CATEGORY &&
            category !== CONSTANTS.SHARE_LINK_CATEGORY
        );
    }, [linksGroups]);

    return (
        <div className={classnames(className, styles['details-panel-container'])}>
            {typeof description === 'string' && description.length > 0 &&
                <div className={styles['description']}>{description}</div>
            }
            {categories.map((category) => (
                <MetaLinks
                    key={category}
                    className={styles['meta-links']}
                    label={category}
                    links={linksGroups.get(category)}
                />
            ))}
        </div>
    );
};

DetailsPanel.propTypes = {
    className: PropTypes.string,
    description: PropTypes.string,
    linksGroups: PropTypes.instanceOf(Map)
};

module.exports = DetailsPanel;
