/** @jest-environment jsdom */

// Copyright (C) 2017-2026 Smart code 203358507

const React = require('react');
const { describe, expect, jest, test } = require('@jest/globals');
const { render, screen } = require('@testing-library/react');

jest.mock('stremio/common/useRouteFocused', () => ({
    RouteFocusedProvider: ({ children }) => children,
}));

jest.mock('../src/router/ModalsContainerContext', () => ({
    ModalsContainerProvider: ({ children }) => children,
}));

jest.mock('stremio/components/RouteLoading', () => ({
    RouteLoading: ({ pathname }) => React.createElement('div', { role: 'status' }, `Loading ${pathname}`),
}));

jest.mock('../src/router/Route/RouteErrorBoundary', () => ({
    RouteErrorBoundary: ({ children }) => children,
    RouteReady: () => React.createElement('div', { 'data-route-ready': true }),
}));

const Route = require('../src/router/Route/Route');

describe('Route', () => {
    test('renders a visible fallback while a lazy route is pending', () => {
        const PendingRoute = React.lazy(() => new Promise(() => {}));

        render(<Route component={<PendingRoute />} focused={true} pathname={'/discover'} />);

        expect(screen.getByRole('status').textContent).toBe('Loading /discover');
        expect(document.querySelector('[data-route-ready]')).toBeNull();
    });
});
