// Copyright (C) 2017-2023 Smart code 203358507

const { FileDropProvider, onFileDrop } = require('./FileDrop');
const { PlatformProvider, usePlatform } = require('./Platform');
const { ToastProvider, useToast } = require('./Toast');
const { TooltipProvider, Tooltip } = require('./Tooltips');
const { ShortcutsProvider, useShortcuts, onShortcut } = require('./Shortcuts');
const { default: getAvatarUrl } = require('./getAvatarUrl');
const CONSTANTS = require('./CONSTANTS');
const { withCoreSuspender, useCoreSuspender } = require('./CoreSuspender');
const getVisibleChildrenRange = require('./getVisibleChildrenRange');
const interfaceLanguages = require('./interfaceLanguages.json');
const languageNames = require('./languageNames.json');
const languages = require('./languages');
const { default: routesRegexp } = require('./routesRegexp');
const { default: useAnimationFrame } = require('./useAnimationFrame');
const { default: useBinaryState } = require('./useBinaryState');
const { default: useFullscreen } = require('./useFullscreen');
const { default: useInterval } = require('./useInterval');
const { default: useLiveRef } = require('./useLiveRef');
const useModelState = require('./useModelState');
const { default: useNotifications } = require('./useNotifications');
const { default: useOnScrollToBottom } = require('./useOnScrollToBottom');
const { default: useProfile } = require('./useProfile');
const { default: useSettings } = require('./useSettings');
const { default: useShell } = require('./useShell');
const { default: useStreamingServer } = require('./useStreamingServer');
const { default: useTimeout } = require('./useTimeout');
const { default: usePlayUrl } = require('./usePlayUrl');
const useTorrent = require('./useTorrent');
const { default: useTranslate } = require('./useTranslate');
const { default: useOrientation } = require('./useOrientation');
const { default: useLanguageSorting } = require('./useLanguageSorting');

module.exports = {
    FileDropProvider,
    onFileDrop,
    PlatformProvider,
    usePlatform,
    ShortcutsProvider,
    useShortcuts,
    onShortcut,
    ToastProvider,
    useToast,
    TooltipProvider,
    Tooltip,
    getAvatarUrl,
    CONSTANTS,
    withCoreSuspender,
    useCoreSuspender,
    getVisibleChildrenRange,
    interfaceLanguages,
    languageNames,
    languages,
    routesRegexp,
    useAnimationFrame,
    useBinaryState,
    useFullscreen,
    useInterval,
    useLiveRef,
    useModelState,
    useNotifications,
    useOnScrollToBottom,
    useProfile,
    useSettings,
    useShell,
    useStreamingServer,
    useTimeout,
    usePlayUrl,
    useTorrent,
    useTranslate,
    useOrientation,
    useLanguageSorting,
};
