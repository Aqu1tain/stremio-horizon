/** @jest-environment jsdom */

// Copyright (C) 2017-2026 Smart code 203358507

const React = require('react');
const { describe, expect, jest, beforeEach, test } = require('@jest/globals');
const { act, fireEvent, render, screen } = require('@testing-library/react');
const { MemoryRouter } = require('react-router-dom');

const mockDispatch = jest.fn();
const mockCoreHandlers = new Map();
const mockStartFacebookLogin = jest.fn();
const mockStopFacebookLogin = jest.fn();
const mockStartAppleLogin = jest.fn();
const mockStopAppleLogin = jest.fn();
const mockCore = {
    transport: { dispatch: mockDispatch },
    on: jest.fn((name, handler) => mockCoreHandlers.set(name, handler)),
    off: jest.fn((name) => mockCoreHandlers.delete(name)),
};

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('stremio/core', () => ({
    useCore: () => mockCore,
}));

jest.mock('stremio/common', () => {
    const React = require('react');

    return {
        useBinaryState: (initialValue) => {
            const [value, setValue] = React.useState(initialValue);
            return [value, () => setValue(true), () => setValue(false)];
        },
    };
});

jest.mock('stremio/common/useRouteFocused', () => ({
    default: () => true,
}));

jest.mock('stremio/components/Icon', () => ({
    default: () => null,
}));

jest.mock('stremio/components', () => {
    const React = require('react');
    const PropTypes = require('prop-types');
    const Image = (props) => React.createElement('img', props);
    const Checkbox = React.forwardRef(({ name, label, link, href, checked, onChange }, ref) => (
        React.createElement('label', null,
            React.createElement('input', {
                ref,
                type: 'checkbox',
                id: name,
                name,
                checked,
                onChange,
            }),
            label,
            href && link ? React.createElement('a', { href }, link) : null
        )
    ));
    const TextInput = React.forwardRef(({ onSubmit, onKeyDown, ...props }, ref) => (
        React.createElement('input', {
            ...props,
            ref,
            onKeyDown: (event) => {
                onKeyDown && onKeyDown(event);
                if (event.key === 'Enter') onSubmit && onSubmit(event);
            },
        })
    ));

    Image.propTypes = { alt: PropTypes.string };
    Checkbox.propTypes = {
        name: PropTypes.string,
        label: PropTypes.string,
        link: PropTypes.string,
        href: PropTypes.string,
        checked: PropTypes.bool,
        onChange: PropTypes.func,
    };
    TextInput.propTypes = {
        onSubmit: PropTypes.func,
        onKeyDown: PropTypes.func,
    };

    return { Image, Checkbox, TextInput };
});

jest.mock('stremio/router/Modal', () => {
    const React = require('react');
    const PropTypes = require('prop-types');
    const Modal = ({ children }) => React.createElement('div', null, children);
    Modal.propTypes = { children: PropTypes.node };
    return Modal;
});

jest.mock('../src/routes/Intro/PasswordResetModal', () => () => null);
jest.mock('../src/routes/Intro/useFacebookLogin', () => () => [mockStartFacebookLogin, mockStopFacebookLogin]);
jest.mock('../src/routes/Intro/useAppleLogin', () => ({
    __esModule: true,
    default: () => [mockStartAppleLogin, mockStopAppleLogin],
}));
jest.mock('../src/routes/Intro/styles', () => ({}), { virtual: true });
jest.mock('/assets/images/logo.png', () => 'logo.png', { virtual: true });

const Intro = require('../src/routes/Intro/Intro');

const renderIntro = (form = 'login') => render(
    React.createElement(
        MemoryRouter,
        {
            initialEntries: [`/intro?form=${form}`],
            future: { v7_startTransition: true, v7_relativeSplatPath: true },
        },
        React.createElement(Intro)
    )
);

describe('Intro authentication', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCoreHandlers.clear();
        mockStartFacebookLogin.mockImplementation(() => new Promise(() => {}));
        mockStartAppleLogin.mockImplementation(() => new Promise(() => {}));
        Element.prototype.scrollIntoView = jest.fn();
    });

    test('exposes a labelled login form with native controls', () => {
        renderIntro();

        expect(screen.getByRole('tab', { name: 'LOG_IN' }).getAttribute('aria-selected')).toBe('true');
        expect(screen.getByRole('textbox', { name: 'EMAIL' }).getAttribute('autocomplete')).toBe('email');
        expect(screen.getByLabelText('PASSWORD').getAttribute('autocomplete')).toBe('current-password');
        expect(screen.getByRole('button', { name: 'LOG_IN' }).getAttribute('type')).toBe('submit');
        expect(screen.getByRole('button', { name: 'FORGOT_PASSWORD' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'FB_LOGIN' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'APPLE_LOGIN' })).toBeTruthy();
    });

    test('keeps the email when switching to registration', () => {
        renderIntro();

        fireEvent.change(screen.getByRole('textbox', { name: 'EMAIL' }), {
            target: { value: 'viewer@example.com' },
        });
        fireEvent.click(screen.getByRole('tab', { name: 'SIGN_UP' }));

        expect(screen.getByRole('textbox', { name: 'EMAIL' }).value).toBe('viewer@example.com');
        expect(screen.getByLabelText('PASSWORD_CONFIRM').getAttribute('autocomplete')).toBe('new-password');
        expect(screen.getAllByRole('checkbox')).toHaveLength(3);
        expect(screen.getByRole('button', { name: 'GUEST_LOGIN' })).toBeTruthy();
    });

    test('shows validation and authentication errors in the form', () => {
        renderIntro();

        fireEvent.click(screen.getByRole('button', { name: 'LOG_IN' }));
        expect(screen.getByRole('alert').textContent).toBe('INVALID_EMAIL');
        expect(mockDispatch).not.toHaveBeenCalled();

        fireEvent.change(screen.getByRole('textbox', { name: 'EMAIL' }), {
            target: { value: 'viewer@example.com' },
        });
        fireEvent.change(screen.getByLabelText('PASSWORD'), {
            target: { value: 'secret' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'LOG_IN' }));

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        act(() => mockCoreHandlers.get('error')({ event: 'UserAuthenticated' }));
        expect(screen.getByRole('alert').textContent).toBe('LOGIN_FAILED');
    });

    test('cancels both social authentication providers', () => {
        renderIntro();

        fireEvent.click(screen.getByRole('button', { name: 'FB_LOGIN' }));
        fireEvent.click(screen.getByRole('button', { name: 'BUTTON_CANCEL' }));

        expect(mockStopFacebookLogin).toHaveBeenCalledTimes(1);
        expect(mockStopAppleLogin).toHaveBeenCalledTimes(1);
    });
});
