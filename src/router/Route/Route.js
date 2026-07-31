// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const { ModalsContainerProvider } = require('../ModalsContainerContext');
const { RouteFocusedProvider } = require('stremio/common/useRouteFocused');
const { RouteLoading } = require('stremio/components/RouteLoading');
const { RouteErrorBoundary, RouteReady } = require('./RouteErrorBoundary');

const Route = ({ component, focused, pathname }) => {
    return (
        <div className={'route-container'}>
            <RouteFocusedProvider value={focused}>
                <ModalsContainerProvider>
                    <div className={'route-content'}>
                        <RouteErrorBoundary key={pathname} pathname={pathname}>
                            <React.Suspense fallback={<RouteLoading pathname={pathname} />}>
                                {component}
                                <RouteReady pathname={pathname} />
                            </React.Suspense>
                        </RouteErrorBoundary>
                    </div>
                </ModalsContainerProvider>
            </RouteFocusedProvider>
        </div>
    );
};

Route.propTypes = {
    component: PropTypes.node,
    focused: PropTypes.bool,
    pathname: PropTypes.string.isRequired,
};

module.exports = Route;
