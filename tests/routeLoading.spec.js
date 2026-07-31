/** @jest-environment jsdom */

// Copyright (C) 2017-2026 Smart code 203358507

const React = require('react');
const { afterEach, describe, expect, jest, test } = require('@jest/globals');
const { fireEvent, render, screen } = require('@testing-library/react');

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('stremio/components/Button', () => {
    const React = require('react');
    const Button = ({ children, onClick }) => React.createElement('button', { onClick }, children);
    return { default: Button };
});

jest.mock('stremio/components/MainNavBars', () => {
    const React = require('react');
    const MainNavBars = ({ children, route }) => React.createElement('div', { 'data-route': route }, children);
    return { default: MainNavBars };
});

jest.mock('../src/components/RouteLoading/RouteLoading.less', () => new Proxy({}, {
    get: (_, property) => property,
}));

const { RouteLoading, getLoadingPresentation } = require('../src/components/RouteLoading/RouteLoading');
const { RouteErrorBoundary, isChunkLoadError } = require('../src/router/Route/RouteErrorBoundary');

describe('resilient route loading', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test.each([
        ['/discover/https%3A%2F%2Fexample.com/movie/catalog', 'grid', 'discover'],
        ['/calendar/2026/7', 'calendar', 'calendar'],
        ['/addons', 'addons', 'addons'],
        ['/settings', 'settings', 'settings'],
        ['/detail/movie/tt123', 'details', 'metadetails'],
        ['/player/stream', 'player', null],
    ])('selects contextual loading UI for %s', (pathname, kind, route) => {
        expect(getLoadingPresentation(pathname)).toEqual({ kind, route });
    });

    test('keeps the selected navigation visible while a route loads', () => {
        const { container } = render(<RouteLoading pathname={'/calendar/2026/7'} />);

        expect(screen.getByRole('status').getAttribute('aria-busy')).toBe('true');
        expect(container.querySelector('[data-route="calendar"]')).toBeTruthy();
        expect(container.querySelectorAll('.calendar-cell')).toHaveLength(35);
    });

    test('classifies only dynamic chunk failures as reloadable', () => {
        expect(isChunkLoadError(Object.assign(new Error('network'), { name: 'ChunkLoadError' }))).toBe(true);
        expect(isChunkLoadError(new Error('Failed to fetch dynamically imported module'))).toBe(true);
        expect(isChunkLoadError(new Error('regular render failure'))).toBe(false);
    });

    test('shows recovery actions when a route render fails', () => {
        const onError = jest.spyOn(console, 'error').mockImplementation(() => {});
        const BrokenRoute = () => {
            throw new Error('regular render failure');
        };

        render(
            <RouteErrorBoundary pathname={'/discover'}>
                <BrokenRoute />
            </RouteErrorBoundary>
        );

        expect(screen.getByRole('alert').textContent).toContain('GENERIC_ERROR_MESSAGE');
        expect(screen.getByRole('button', { name: 'TRY_AGAIN' })).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'WEBSITE_GO_HOME' }));
        expect(window.location.hash).toBe('#/');
        onError.mockRestore();
    });
});
