// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');

const Addons = React.lazy(() => import(/* webpackChunkName: "addons" */ './Addons'));
const Board = React.lazy(() => import(/* webpackChunkName: "board" */ './Board'));
const Calendar = React.lazy(() => import(/* webpackChunkName: "calendar" */ './Calendar'));
const Discover = React.lazy(() => import(/* webpackChunkName: "discover" */ './Discover'));
const Intro = React.lazy(() => import(/* webpackChunkName: "intro" */ './Intro'));
const Library = React.lazy(() => import(/* webpackChunkName: "library" */ './Library'));
const MetaDetails = React.lazy(() => import(/* webpackChunkName: "metadetails" */ './MetaDetails'));
const Player = React.lazy(() => import(/* webpackChunkName: "player" */ './Player'));
const Search = React.lazy(() => import(/* webpackChunkName: "search" */ './Search'));
const Settings = React.lazy(() => import(/* webpackChunkName: "settings" */ './Settings'));
const NotFound = require('./NotFound');

module.exports = {
    Addons,
    Board,
    Calendar,
    Discover,
    Intro,
    Library,
    MetaDetails,
    NotFound,
    Search,
    Settings,
    Player
};
