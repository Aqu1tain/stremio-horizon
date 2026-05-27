/**
 * @jest-environment jsdom
 */
import { mockIPC, clearMocks } from '@tauri-apps/api/mocks';
import { invokeTauri } from 'stremio/lib/tauri-events';

describe('updater scenario: update-failed', () => {
    afterEach(() => clearMocks());

    test('install_update rejects when the backend reports an error', async () => {
        mockIPC((cmd: string) => {
            if (cmd === 'install_update') throw new Error('install failed');
            return null;
        });
        await expect(invokeTauri('install_update')).rejects.toThrow('install failed');
    });

    test('check_for_updates_now rejects when the manifest is unreachable', async () => {
        mockIPC((cmd: string) => {
            if (cmd === 'check_for_updates_now') throw new Error('manifest fetch failed');
            return null;
        });
        await expect(invokeTauri('check_for_updates_now')).rejects.toThrow('manifest fetch failed');
    });
});
