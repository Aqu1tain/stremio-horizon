import useModelState from 'stremio/common/useModelState';

const map = (ctx: any) => ctx.notifications;

const useNotifications = (): Notifications => {
    // @ts-expect-error useModelState is untyped, action is optional
    return useModelState({ model: 'ctx', map });
};

export default useNotifications;
