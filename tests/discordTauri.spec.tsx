/**
 * @jest-environment jsdom
 */

import React, { useEffect } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { clearMocks, mockIPC } from '@tauri-apps/api/mocks';
import { DiscordProvider, useDiscord } from 'stremio/common/Discord';

const mockShell = {
    active: false,
    on: jest.fn(),
    off: jest.fn(),
    send: jest.fn(),
};

let mockDiscordEnabled = false;

jest.mock('stremio/common/Platform', () => ({
    usePlatform: () => ({ shell: mockShell }),
}));

jest.mock('stremio/common/useProfile', () => ({
    __esModule: true,
    default: () => ({ settings: { discordRpcEnabled: mockDiscordEnabled } }),
}));

const Harness = ({ publish }: { publish: boolean }) => {
    const discord = useDiscord();

    useEffect(() => {
        if (!publish) return;
        discord.setActivity({
            state: 'Watching',
            details: 'Hunter x Hunter · S1:E57',
            image: 'https://example.com/episode.jpg',
        });
    }, [discord.setActivity, publish]);

    return <div data-available={discord.available} data-connected={discord.connected} />;
};

describe('Discord RPC in Tauri', () => {
    const commands: string[] = [];

    beforeEach(() => {
        commands.length = 0;
        mockDiscordEnabled = false;
        mockIPC((cmd: string) => {
            commands.push(cmd);
            if (cmd === 'discord_connect') return true;
            return null;
        });
    });

    afterEach(() => {
        clearMocks();
        jest.clearAllMocks();
    });

    test('stays private until enabled, then publishes and disconnects when disabled', async () => {
        const view = render(
            <DiscordProvider>
                <Harness publish />
            </DiscordProvider>
        );

        expect(view.container.firstElementChild?.getAttribute('data-available')).toBe('true');
        expect(commands).not.toContain('discord_connect');

        await act(async () => {
            mockDiscordEnabled = true;
            view.rerender(
                <DiscordProvider>
                    <Harness publish />
                </DiscordProvider>
            );
        });

        await waitFor(() => expect(commands).toContain('discord_connect'));
        await waitFor(() => expect(commands).toContain('discord_set_activity'));

        await act(async () => {
            mockDiscordEnabled = false;
            view.rerender(
                <DiscordProvider>
                    <Harness publish />
                </DiscordProvider>
            );
        });

        await waitFor(() => expect(commands).toContain('discord_disconnect'));
    });
});
