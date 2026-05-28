/**
 * @jest-environment jsdom
 */
import { mockIPC, clearMocks } from '@tauri-apps/api/mocks';
import { invokeTauri } from 'stremio/lib/tauri-events';

describe('updater scenario: no-update', () => {
    afterEach(() => clearMocks());

    test('get_pending_update returns null when nothing is pending', async () => {
        mockIPC((cmd: string) => {
            if (cmd === 'get_pending_update') return null;
            throw new Error(`unexpected command: ${cmd}`);
        });
        await expect(invokeTauri('get_pending_update')).resolves.toBeNull();
    });

    test('check_for_updates_now returns null when there is no new release', async () => {
        mockIPC((cmd: string) => {
            if (cmd === 'check_for_updates_now') return null;
            throw new Error(`unexpected command: ${cmd}`);
        });
        await expect(invokeTauri('check_for_updates_now')).resolves.toBeNull();
    });
});
