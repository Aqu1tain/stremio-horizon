/**
 * @jest-environment jsdom
 */
import { mockIPC, clearMocks } from '@tauri-apps/api/mocks';
import { invokeTauri } from 'stremio/lib/tauri-events';

const PENDING_UPDATE = { version: '0.4.0', body: 'Release notes' };

describe('updater scenario: update-available', () => {
    afterEach(() => clearMocks());

    test('get_pending_update returns the pending UpdateInfo', async () => {
        mockIPC((cmd: string) => {
            if (cmd === 'get_pending_update') return PENDING_UPDATE;
            throw new Error(`unexpected command: ${cmd}`);
        });
        await expect(invokeTauri('get_pending_update')).resolves.toEqual(PENDING_UPDATE);
    });

    test('check_for_updates_now returns the same UpdateInfo', async () => {
        mockIPC((cmd: string) => {
            if (cmd === 'check_for_updates_now') return PENDING_UPDATE;
            throw new Error(`unexpected command: ${cmd}`);
        });
        await expect(invokeTauri('check_for_updates_now')).resolves.toEqual(PENDING_UPDATE);
    });
});
