// Minimal hls.js stand-in: records listeners so tests can fire synthetic errors,
// and spies the three recovery calls the patch is expected to make.

const build = ({ events, errorTypes, errorDetails }) => {
    function FakeHls() {
        const listeners = {};

        this.startLoad = jest.fn();
        this.recoverMediaError = jest.fn();
        this.swapAudioCodec = jest.fn();
        this.loadSource = jest.fn();
        this.attachMedia = jest.fn();
        this.destroy = jest.fn();
        this.detachMedia = jest.fn();

        this.on = jest.fn((event, listener) => {
            listeners[event] = listeners[event] || [];
            listeners[event].push(listener);
        });

        this.removeAllListeners = jest.fn(() => {
            Object.keys(listeners).forEach((event) => delete listeners[event]);
        });

        this.emit = (event, data) => {
            (listeners[event] || []).forEach((listener) => listener(event, data));
        };

        this.listenerCount = (event) => (listeners[event] || []).length;

        FakeHls.instances.push(this);
    }

    FakeHls.instances = [];
    FakeHls.isSupported = () => true;
    FakeHls.Events = events;
    FakeHls.ErrorTypes = errorTypes;
    FakeHls.ErrorDetails = errorDetails;

    return FakeHls;
};

module.exports = { build };
