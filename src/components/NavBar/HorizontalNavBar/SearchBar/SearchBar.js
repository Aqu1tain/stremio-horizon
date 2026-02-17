// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const debounce = require('lodash.debounce');
const { useTranslation } = require('react-i18next');
const { default: Icon } = require('stremio/components/Icon');
const { useRouteFocused } = require('stremio-router');
const Button = require('stremio/components/Button').default;
const TextInput = require('stremio/components/TextInput').default;
const useTorrent = require('stremio/common/useTorrent');
const { withCoreSuspender } = require('stremio/common/CoreSuspender');
const useSearchHistory = require('./useSearchHistory');
const useLocalSearch = require('./useLocalSearch');
const styles = require('./styles');
const { default: useBinaryState } = require('stremio/common/useBinaryState');

const SearchBar = React.memo(({ className, query, active }) => {
    const { t } = useTranslation();
    const routeFocused = useRouteFocused();
    const searchHistory = useSearchHistory();
    const localSearch = useLocalSearch();
    const { createTorrentFromMagnet } = useTorrent();

    const [historyOpen, openHistory, closeHistory, ] = useBinaryState(query === null ? true : false);
    const [currentQuery, setCurrentQuery] = React.useState(query || '');

    const searchInputRef = React.useRef(null);
    const containerRef = React.useRef(null);

    const searchHistoryOnClose = React.useCallback((event) => {
        if (historyOpen && containerRef.current && !containerRef.current.contains(event.target)) {
            closeHistory();
        }
    }, [historyOpen]);

    React.useEffect(() => {
        document.addEventListener('mousedown', searchHistoryOnClose);
        return () => {
            document.removeEventListener('mousedown', searchHistoryOnClose);
        };
    }, [searchHistoryOnClose]);

    const queryInputOnChange = React.useCallback(() => {
        const value = searchInputRef.current.value;
        setCurrentQuery(value);
        openHistory();
        try {
            createTorrentFromMagnet(value);
        } catch (error) {
            console.error('Failed to create torrent from magnet:', error);
        }
    }, [createTorrentFromMagnet]);

    const queryInputOnSubmit = React.useCallback((event) => {
        event.preventDefault();
        const searchValue = `/search?search=${encodeURIComponent(event.target.value)}`;
        setCurrentQuery(searchValue);
        if (searchInputRef.current && searchValue) {
            window.location.hash = searchValue;
            closeHistory();
        }
    }, []);

    const queryInputClear = React.useCallback(() => {
        searchInputRef.current.value = '';
        setCurrentQuery('');
        window.location.hash = '/search';
    }, []);

    const updateLocalSearchDebounced = React.useCallback(debounce((query) => {
        localSearch.search(query);
    }, 250), []);

    React.useEffect(() => {
        updateLocalSearchDebounced(currentQuery);
    }, [currentQuery]);

    React.useEffect(() => {
        if (routeFocused && active) {
            searchInputRef.current.focus();
        }
    }, [routeFocused, active]);

    React.useEffect(() => {
        return () => {
            updateLocalSearchDebounced.cancel();
        };
    }, []);

    if (!active) return <SearchIconButton className={className} />;

    const hasDropdown = historyOpen && (searchHistory?.items?.length || localSearch?.items?.length);

    return (
        <div className={classnames(className, styles['search-bar-container'], 'active')} ref={containerRef}>
            <TextInput
                key={query}
                ref={searchInputRef}
                className={styles['search-input']}
                type={'text'}
                placeholder={t('SEARCH_OR_PASTE_LINK')}
                defaultValue={query}
                tabIndex={-1}
                onChange={queryInputOnChange}
                onSubmit={queryInputOnSubmit}
                onClick={openHistory}
            />
            <Button className={styles['submit-button-container']} onClick={currentQuery.length > 0 ? queryInputClear : undefined}>
                <Icon className={styles['icon']} name={currentQuery.length > 0 ? 'close' : 'search'} />
            </Button>
            {hasDropdown &&
                <div className={styles['menu-container']}>
                    {searchHistory?.items?.length > 0 &&
                        <div className={styles['items']}>
                            <div className={styles['title']}>
                                <div className={styles['label']}>{t('STREMIO_TV_SEARCH_HISTORY_TITLE')}</div>
                                <button className={styles['search-history-clear']} onClick={searchHistory.clear}>
                                    {t('CLEAR_HISTORY')}
                                </button>
                            </div>
                            {searchHistory.items.slice(0, 8).map(({ query, deepLinks }, index) => (
                                <Button key={index} className={styles['item']} href={deepLinks.search} onClick={closeHistory}>
                                    {query}
                                </Button>
                            ))}
                        </div>
                    }
                    {localSearch?.items?.length > 0 &&
                        <div className={styles['items']}>
                            <div className={styles['title']}>
                                <div className={styles['label']}>{t('SEARCH_SUGGESTIONS')}</div>
                            </div>
                            {localSearch.items.map(({ query, deepLinks }, index) => (
                                <Button key={index} className={styles['item']} href={deepLinks.search} onClick={closeHistory}>
                                    {query}
                                </Button>
                            ))}
                        </div>
                    }
                </div>
            }
        </div>
    );
});

SearchBar.displayName = 'SearchBar';

SearchBar.propTypes = {
    className: PropTypes.string,
    query: PropTypes.string,
    active: PropTypes.bool
};

const SearchIconButton = ({ className }) => (
    <Button className={classnames(className, styles['search-icon-button'])} tabIndex={-1} href={'#/search'}>
        <Icon className={styles['icon']} name={'search'} />
    </Button>
);

const SearchBarFallback = SearchIconButton;

SearchIconButton.propTypes = {
    className: PropTypes.string,
};

SearchBarFallback.propTypes = SearchBar.propTypes;

module.exports = withCoreSuspender(SearchBar, SearchBarFallback);
