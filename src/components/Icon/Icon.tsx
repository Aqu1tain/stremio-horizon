import React, { forwardRef } from 'react';
import {
    Play, Pause, X, Search, Settings, Download, Share2, Link,
    ChevronLeft, ChevronRight, ChevronDown, Check,
    MoreHorizontal, MoreVertical, Plus, Minus, Trash2,
    Eye, Info, HelpCircle, User, UserRound,
    RotateCcw, SkipForward, Maximize, Minimize,
    VolumeOff, VolumeX, Volume, Volume1, Volume2,
    Calendar, Cast, Globe, Gauge,
    Heart, ThumbsUp, CircleAlert,
    Captions, AudioLines, ListVideo, SlidersHorizontal,
    Clapperboard, Users, Megaphone, Glasses, Smartphone,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import StremioIcon from '@stremio/stremio-icons/react';

const LUCIDE_MAP: Record<string, LucideIcon> = {
    'play': Play,
    'pause': Pause,
    'close': X,
    'x': X,
    'search': Search,
    'settings': Settings,
    'download': Download,
    'share': Share2,
    'link': Link,
    'chevron-back': ChevronLeft,
    'chevron-forward': ChevronRight,
    'caret-down': ChevronDown,
    'caret-left': ChevronLeft,
    'caret-right': ChevronRight,
    'checkmark': Check,
    'more-horizontal': MoreHorizontal,
    'more-vertical': MoreVertical,
    'add': Plus,
    'remove': Minus,
    'bin': Trash2,
    'eye': Eye,
    'info': Info,
    'help': HelpCircle,
    'person': User,
    'person-outline': UserRound,
    'reset': RotateCcw,
    'next': SkipForward,
    'maximize': Maximize,
    'minimize': Minimize,
    'volume-off': VolumeOff,
    'volume-mute': VolumeX,
    'volume-low': Volume,
    'volume-medium': Volume1,
    'volume-high': Volume2,
    'calendar': Calendar,
    'cast': Cast,
    'network': Globe,
    'speed': Gauge,
    'heart': Heart,
    'heart-outline': Heart,
    'thumbs-up': ThumbsUp,
    'thumbs-up-outline': ThumbsUp,
    'about': CircleAlert,
    'subtitles': Captions,
    'audio-tracks': AudioLines,
    'episodes': ListVideo,
    'filters': SlidersHorizontal,
    'trailer': Clapperboard,
    'actors': Users,
    'megaphone': Megaphone,
    'glasses': Glasses,
    'remote': Smartphone,
};

const FILLED_ICONS = new Set(['heart', 'thumbs-up']);

type IconProps = {
    name: string;
    className?: string;
};

const Icon = forwardRef<SVGSVGElement, IconProps>(({ name, className }, ref) => {
    const LucideComponent = LUCIDE_MAP[name];

    if (LucideComponent) {
        const filled = FILLED_ICONS.has(name);
        return (
            <LucideComponent
                ref={ref}
                className={className}
                fill={filled ? 'currentColor' : 'none'}
                strokeWidth={filled ? 0 : 2}
            />
        );
    }

    return <StremioIcon ref={ref} name={name} className={className} />;
});

Icon.displayName = 'Icon';

export default React.memo(Icon);
