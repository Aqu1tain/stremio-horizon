/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockIPC, clearMocks } from '@tauri-apps/api/mocks';
import { UpdaterBannerHarness } from './__harness__/UpdaterBannerHarness';

describe('updater scenario: update-available (UI oracle)', () => {
    afterEach(() => clearMocks());

    test('user-visible banner appears with version when an update is pending at mount', async () => {
        mockIPC((cmd: string) => {
            if (cmd === 'get_pending_update') return { version: '0.4.0', body: 'Release notes' };
            if (cmd === 'plugin:event|listen') return 0;
            return null;
        });

        render(<UpdaterBannerHarness />);

        // get_pending_update is async; wait for the harness to re-render with the resolved value.
        const versionElement = await screen.findByTestId('update-version');
        expect(versionElement.textContent).toBe('0.4.0');
        expect(screen.queryByTestId('update-banner')).not.toBeNull();
    });
});
