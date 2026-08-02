import React, { forwardRef } from 'react';
import Play from 'lucide-react/dist/esm/icons/play.js';
import Pause from 'lucide-react/dist/esm/icons/pause.js';
import X from 'lucide-react/dist/esm/icons/x.js';
import Search from 'lucide-react/dist/esm/icons/search.js';
import Settings from 'lucide-react/dist/esm/icons/settings.js';
import Download from 'lucide-react/dist/esm/icons/download.js';
import Share2 from 'lucide-react/dist/esm/icons/share-2.js';
import Link from 'lucide-react/dist/esm/icons/link.js';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left.js';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right.js';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down.js';
import Check from 'lucide-react/dist/esm/icons/check.js';
import MoreHorizontal from 'lucide-react/dist/esm/icons/ellipsis.js';
import MoreVertical from 'lucide-react/dist/esm/icons/ellipsis-vertical.js';
import Plus from 'lucide-react/dist/esm/icons/plus.js';
import Minus from 'lucide-react/dist/esm/icons/minus.js';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2.js';
import Eye from 'lucide-react/dist/esm/icons/eye.js';
import Info from 'lucide-react/dist/esm/icons/info.js';
import HelpCircle from 'lucide-react/dist/esm/icons/circle-question-mark.js';
import User from 'lucide-react/dist/esm/icons/user.js';
import UserRound from 'lucide-react/dist/esm/icons/circle-user-round.js';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw.js';
import SkipForward from 'lucide-react/dist/esm/icons/skip-forward.js';
import Maximize from 'lucide-react/dist/esm/icons/maximize.js';
import Minimize from 'lucide-react/dist/esm/icons/minimize.js';
import VolumeOff from 'lucide-react/dist/esm/icons/volume-off.js';
import VolumeX from 'lucide-react/dist/esm/icons/volume-x.js';
import Volume from 'lucide-react/dist/esm/icons/volume.js';
import Volume1 from 'lucide-react/dist/esm/icons/volume-1.js';
import Volume2 from 'lucide-react/dist/esm/icons/volume-2.js';
import Calendar from 'lucide-react/dist/esm/icons/calendar.js';
import Cast from 'lucide-react/dist/esm/icons/cast.js';
import Globe from 'lucide-react/dist/esm/icons/globe.js';
import Gauge from 'lucide-react/dist/esm/icons/gauge.js';
import Heart from 'lucide-react/dist/esm/icons/heart.js';
import ThumbsUp from 'lucide-react/dist/esm/icons/thumbs-up.js';
import CircleAlert from 'lucide-react/dist/esm/icons/circle-alert.js';
import Captions from 'lucide-react/dist/esm/icons/captions.js';
import AudioLines from 'lucide-react/dist/esm/icons/audio-lines.js';
import ListVideo from 'lucide-react/dist/esm/icons/list-video.js';
import SlidersHorizontal from 'lucide-react/dist/esm/icons/sliders-horizontal.js';
import Clapperboard from 'lucide-react/dist/esm/icons/clapperboard.js';
import Users from 'lucide-react/dist/esm/icons/users.js';
import Megaphone from 'lucide-react/dist/esm/icons/megaphone.js';
import Glasses from 'lucide-react/dist/esm/icons/glasses.js';
import Smartphone from 'lucide-react/dist/esm/icons/smartphone.js';
import Keyboard from 'lucide-react/dist/esm/icons/keyboard.js';
import Copy from 'lucide-react/dist/esm/icons/copy.js';
import PictureInPicture2 from 'lucide-react/dist/esm/icons/picture-in-picture-2.js';
import type { LucideIcon } from 'lucide-react';

const StremioIcon = React.lazy(() => import(
    /* webpackChunkName: "legacy-icons" */
    '@stremio/stremio-icons/react'
).then((module) => ({ default: module.default })));

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
    'keyboard': Keyboard,
    'copy': Copy,
    'picture-in-picture': PictureInPicture2,
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

    return (
        <React.Suspense fallback={null}>
            <StremioIcon ref={ref} name={name} className={className} />
        </React.Suspense>
    );
});

Icon.displayName = 'Icon';

export default React.memo(Icon);
