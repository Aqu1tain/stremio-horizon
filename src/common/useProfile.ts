import useModelState from 'stremio/common/useModelState';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const map = (ctx: any) => ({
    ...ctx.profile,
    settings: {
        ...ctx.profile.settings,
        streamingServerWarningDismissed: new Date(
            typeof ctx.profile.settings.streamingServerWarningDismissed === 'string' ?
                ctx.profile.settings.streamingServerWarningDismissed
                :
                NaN
        )
    }
});

const useProfile = (): Profile => {
    // @ts-expect-error useModelState is untyped, action is optional
    return useModelState({ model: 'ctx', map });
};

export default useProfile;
