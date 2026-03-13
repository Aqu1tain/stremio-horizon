const anonymousAvatar = require('/assets/images/anonymous.webp');
const defaultAvatar = require('/assets/images/default_avatar.webp');

const getAvatarUrl = (auth: { user: { avatar: string } } | null): string => {
    if (!auth) return `url('${anonymousAvatar}')`;
    return auth.user.avatar ? `url('${auth.user.avatar}')` : `url('${defaultAvatar}')`;
};

export default getAvatarUrl;
