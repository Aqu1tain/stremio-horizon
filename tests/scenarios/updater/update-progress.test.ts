/**
 * @jest-environment jsdom
 */
import { mockIPC, clearMocks } from '@tauri-apps/api/mocks';
import { invokeTauri } from 'stremio/lib/tauri-events';

describe('updater scenario: update-progress', () => {
    afterEach(() => clearMocks());

    test('install_update can be invoked and resolves', async () => {
        const calls: string[] = [];
        mockIPC((cmd: string) => {
            calls.push(cmd);
            return null;
        });
        await invokeTauri('install_update');
        expect(calls).toEqual(['install_update']);
    });
});
