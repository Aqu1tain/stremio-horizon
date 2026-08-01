// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const { useCore } = require('stremio/core');
const LibItem = require('stremio/components/LibItem');
const getContinueWatchingArtwork = require('stremio/lib/continue-watching-artwork');
const getContinueWatchingLabel = require('stremio/lib/continue-watching-label');

const ContinueWatchingItem = ({ _id, type, name, poster, state, notifications, ...props }) => {
    const core = useCore();

    const artwork = React.useMemo(() => getContinueWatchingArtwork({
        id: _id,
        type,
        videoId: state?.videoId,
        poster,
    }), [_id, poster, state?.videoId, type]);
    const displayName = React.useMemo(() => getContinueWatchingLabel({
        name,
        type,
        videoId: state?.videoId,
    }), [name, state?.videoId, type]);

    const onDismissClick = React.useCallback((event) => {
        event.preventDefault();
        if (typeof _id === 'string') {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'RewindLibraryItem',
                    args: _id
                }
            });
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'DismissNotificationItem',
                    args: _id
                }
            });
        }
    }, [_id]);

    return (
        <LibItem
            {...props}
            _id={_id}
            type={type}
            name={displayName}
            poster={artwork.poster}
            posterFallback={artwork.fallbackPoster}
            state={state}
            posterChangeCursor={true}
            notifications={notifications}
            onDismissClick={onDismissClick}
        />
    );
};

ContinueWatchingItem.propTypes = {
    _id: PropTypes.string,
    type: PropTypes.string,
    name: PropTypes.string,
    poster: PropTypes.string,
    state: PropTypes.shape({
        videoId: PropTypes.string,
    }),
    notifications: PropTypes.object,
    deepLinks: PropTypes.shape({
        metaDetailsVideos: PropTypes.string,
        metaDetailsStreams: PropTypes.string,
        player: PropTypes.string
    }),
};

module.exports = ContinueWatchingItem;
