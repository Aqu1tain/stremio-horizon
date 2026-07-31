/** @jest-environment jsdom */

// Copyright (C) 2017-2026 Smart code 203358507

const React = require('react');
const { describe, expect, jest, test } = require('@jest/globals');
const { render, screen } = require('@testing-library/react');

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => ({
            PLAYER_ALLDEBRID_VPN_HINT: 'This AllDebrid stream may be blocked by your VPN or current IP address.',
            PLAYER_ALLDEBRID_VPN_HELP: 'Open AllDebrid VPN help',
        })[key] ?? key,
    }),
}));

jest.mock('stremio/components/Icon', () => ({
    default: () => null,
}));

jest.mock('stremio/components', () => {
    const React = require('react');
    const PropTypes = require('prop-types');
    const Button = ({ children, ...props }) => React.createElement('a', props, children);

    Button.propTypes = {
        children: PropTypes.node,
    };

    return {
        Button,
    };
});

jest.mock('../src/routes/Player/Error/styles', () => ({}), { virtual: true });

const PlayerError = require('../src/routes/Player/Error/Error');

describe('Player Error', () => {
    test('shows the AllDebrid VPN hint for an unsupported AllDebrid stream', () => {
        render(React.createElement(PlayerError, {
            code: 4,
            message: 'Video not supported',
            stream: { url: 'https://ombfyx.debrid.it/file/movie.mp4' },
        }));

        expect(screen.getByText(/may be blocked by your VPN/i)).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Open AllDebrid VPN help' }).getAttribute('href'))
            .toBe('https://alldebrid.com/vpn');
    });

    test('keeps the generic error for unsupported non-AllDebrid streams', () => {
        render(React.createElement(PlayerError, {
            code: 4,
            message: 'Video not supported',
            stream: { url: 'https://example.com/file/movie.mp4' },
        }));

        expect(screen.getByText('Video not supported')).toBeTruthy();
        expect(screen.queryByText(/may be blocked by your VPN/i)).toBeNull();
    });

    test('uses the original stream when playback has been proxied locally', () => {
        render(React.createElement(PlayerError, {
            code: 4,
            message: 'Video not supported',
            stream: { url: 'http://127.0.0.1:11470/proxy/movie.mp4' },
            sourceStream: { url: 'https://ombfyx.debrid.it/file/movie.mp4' },
        }));

        expect(screen.getByText(/may be blocked by your VPN/i)).toBeTruthy();
    });
});
