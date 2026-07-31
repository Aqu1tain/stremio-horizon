// Copyright (C) 2017-2026 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const { RouteLoading } = require('stremio/components/RouteLoading');

const CHUNK_RELOAD_PREFIX = 'stremio:route-chunk-reload:';

const isChunkLoadError = (error) => {
    const name = typeof error?.name === 'string' ? error.name : '';
    const message = typeof error?.message === 'string' ? error.message : '';

    return name === 'ChunkLoadError' ||
        /Loading chunk [\d]+ failed/i.test(message) ||
        /Failed to fetch dynamically imported module/i.test(message) ||
        /Importing a module script failed/i.test(message);
};

const getReloadKey = (pathname) => `${CHUNK_RELOAD_PREFIX}${pathname}`;

const clearReloadAttempt = (pathname) => {
    try {
        window.sessionStorage.removeItem(getReloadKey(pathname));
    } catch {
        // Storage can be unavailable in privacy-focused browser contexts.
    }
};

const RouteReady = ({ pathname }) => {
    React.useEffect(() => clearReloadAttempt(pathname), [pathname]);
    return null;
};

RouteReady.propTypes = {
    pathname: PropTypes.string.isRequired,
};

class RouteErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
        this.retry = this.retry.bind(this);
        this.goHome = this.goHome.bind(this);
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error) {
        if (!isChunkLoadError(error) || process.env.NODE_ENV === 'test') {
            return;
        }

        try {
            const reloadKey = getReloadKey(this.props.pathname);
            if (window.sessionStorage.getItem(reloadKey) === null) {
                window.sessionStorage.setItem(reloadKey, '1');
                window.location.reload();
            }
        } catch {
            // The visible recovery state remains available when storage or reload fails.
        }
    }

    retry() {
        clearReloadAttempt(this.props.pathname);
        window.location.reload();
    }

    goHome() {
        clearReloadAttempt(this.props.pathname);
        window.location.hash = '#/';
    }

    render() {
        if (this.state.error !== null) {
            return (
                <RouteLoading
                    pathname={this.props.pathname}
                    error={true}
                    onRetry={this.retry}
                    onHome={this.goHome}
                />
            );
        }

        return this.props.children;
    }
}

RouteErrorBoundary.propTypes = {
    pathname: PropTypes.string.isRequired,
    children: PropTypes.node,
};

module.exports = { RouteErrorBoundary, RouteReady, isChunkLoadError };
