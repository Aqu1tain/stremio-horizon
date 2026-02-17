import useModelState from 'stremio/common/useModelState';

const useStreamingServer = (): StreamingServer => {
    // @ts-expect-error useModelState is untyped, action is optional
    return useModelState({ model: 'streaming_server' });
};

export default useStreamingServer;
