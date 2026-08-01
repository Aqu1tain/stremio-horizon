import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePlatform } from '../Platform';
import { invokeTauri, isTauri } from '../tauri';
import useProfile from '../useProfile';
import type { DiscordActivity as Activity } from './activity';

const CONNECT_RETRY_INTERVAL = 15000;

type DiscordContextValue = {
    available: boolean,
    connected: boolean,
    enabled: boolean,
    setActivity: (activity: Activity | null) => void,
};

const DiscordContext = createContext<DiscordContextValue | null>(null);

const sameActivity = (first: Activity | null, second: Activity | null) => {
    return first?.state === second?.state &&
        first?.details === second?.details &&
        first?.image === second?.image &&
        first?.startTimestamp === second?.startTimestamp &&
        first?.endTimestamp === second?.endTimestamp;
};

type Props = {
    children: React.ReactNode,
};

const DiscordProvider = ({ children }: Props) => {
    const { shell } = usePlatform();
    const profile = useProfile();
    const enabled = profile.settings?.discordRpcEnabled === true;
    const tauriAvailable = isTauri();
    const available = shell.active === true || tauriAvailable;
    const [connected, setConnected] = useState(false);
    const [activity, setActivityState] = useState<Activity | null>(null);
    const sentActivity = useRef<Activity | null>(null);
    const connectRequested = useRef(false);
    const shellRef = useRef(shell);
    shellRef.current = shell;

    useEffect(() => {
        if (!shell.active) return;

        const onStatus = (data: { connected: boolean }) => {
            connectRequested.current = false;
            setConnected(data.connected === true);
        };

        shellRef.current.on('discord-status', onStatus);

        return () => {
            shellRef.current.off('discord-status', onStatus);
        };
    }, [shell.active]);

    useEffect(() => {
        if (!available) {
            connectRequested.current = false;
            setConnected(false);
            sentActivity.current = null;
            return;
        }

        if (!enabled) {
            connectRequested.current = false;
            if (connected) {
                if (tauriAvailable) {
                    invokeTauri('discord_disconnect')
                        .catch(() => undefined)
                        .finally(() => setConnected(false));
                } else {
                    shellRef.current.send('discord-disconnect', {});
                }
            }
            sentActivity.current = null;
            return;
        }

        if (connected) return;

        const requestConnect = () => {
            if (!connectRequested.current) {
                connectRequested.current = true;
                if (tauriAvailable) {
                    invokeTauri<boolean>('discord_connect')
                        .then((isConnected) => setConnected(isConnected === true))
                        .catch(() => setConnected(false))
                        .finally(() => {
                            connectRequested.current = false;
                        });
                } else {
                    shellRef.current.send('discord-connect', {});
                }
            }
        };

        requestConnect();
        const interval = window.setInterval(requestConnect, CONNECT_RETRY_INTERVAL);

        return () => {
            window.clearInterval(interval);
        };
    }, [available, connected, enabled, tauriAvailable]);

    useEffect(() => {
        if (!available || !enabled || !connected) return;

        if (activity === null) {
            if (sentActivity.current !== null) {
                if (tauriAvailable) {
                    invokeTauri('discord_clear_activity').catch(() => setConnected(false));
                } else {
                    shellRef.current.send('discord-clear-activity', {});
                }
                sentActivity.current = null;
            }
            return;
        }

        if (sameActivity(sentActivity.current, activity)) return;

        const payload = {
            state: activity.state,
            details: activity.details || '',
            image: activity.image || null,
            startTimestamp: activity.startTimestamp || null,
            endTimestamp: activity.endTimestamp || null,
        };
        if (tauriAvailable) {
            invokeTauri('discord_set_activity', { activity: payload })
                .catch(() => {
                    sentActivity.current = null;
                    setConnected(false);
                });
        } else {
            shellRef.current.send('discord-set-activity', payload);
        }
        sentActivity.current = activity;
    }, [activity, available, connected, enabled, tauriAvailable]);

    const setActivity = useCallback((nextActivity: Activity | null) => {
        setActivityState((currentActivity) => sameActivity(currentActivity, nextActivity) ? currentActivity : nextActivity);
    }, []);

    const value = useMemo(() => ({
        available,
        connected,
        enabled,
        setActivity,
    }), [available, connected, enabled, setActivity]);

    return (
        <DiscordContext.Provider value={value}>
            {children}
        </DiscordContext.Provider>
    );
};

const useDiscord = () => {
    const value = useContext(DiscordContext);
    if (value === null) {
        throw new Error('useDiscord must be used inside DiscordProvider');
    }
    return value;
};

export {
    DiscordProvider,
    useDiscord,
};
