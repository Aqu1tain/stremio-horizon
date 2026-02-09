const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Button } = require('stremio/components/Button');
const styles = require('./styles');

const TabBar = ({ className, tabs, selected, onSelect }) => {
    return (
        <div className={classnames(className, styles['tab-bar-container'])}>
            {tabs.map(({ id, label }) => (
                <Button
                    key={id}
                    className={classnames(styles['tab'], { [styles['active']]: selected === id })}
                    onClick={() => onSelect(id)}
                >
                    {label}
                </Button>
            ))}
        </div>
    );
};

TabBar.propTypes = {
    className: PropTypes.string,
    tabs: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        label: PropTypes.string
    })),
    selected: PropTypes.string,
    onSelect: PropTypes.func
};

module.exports = TabBar;
