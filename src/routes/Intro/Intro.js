// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useTranslation } = require('react-i18next');
const { useSearchParams, useNavigate } = require('react-router-dom');
const classnames = require('classnames');
const { default: Icon } = require('stremio/components/Icon');
const Modal = require('stremio/router/Modal');
const { useCore } = require('stremio/core');
const { useBinaryState } = require('stremio/common');
const { default: useRouteFocused } = require('stremio/common/useRouteFocused');
const { Image, Checkbox } = require('stremio/components');
const CredentialsTextInput = require('./CredentialsTextInput');
const PasswordResetModal = require('./PasswordResetModal');
const useFacebookLogin = require('./useFacebookLogin');
const { default: useAppleLogin } = require('./useAppleLogin');

const styles = require('./styles');

const SIGNUP_FORM = 'signup';
const LOGIN_FORM = 'login';

const Intro = () => {
    const [queryParams, setQueryParams] = useSearchParams();
    const navigate = useNavigate();
    const core = useCore();
    const { t } = useTranslation();
    const routeFocused = useRouteFocused();
    const [startFacebookLogin, stopFacebookLogin] = useFacebookLogin();
    const [startAppleLogin, stopAppleLogin] = useAppleLogin();
    const emailRef = React.useRef(null);
    const passwordRef = React.useRef(null);
    const confirmPasswordRef = React.useRef(null);
    const termsRef = React.useRef(null);
    const privacyPolicyRef = React.useRef(null);
    const marketingRef = React.useRef(null);
    const errorRef = React.useRef(null);
    const [passwordRestModalOpen, openPasswordRestModal, closePasswordResetModal] = useBinaryState(false);
    const [loaderModalOpen, openLoaderModal, closeLoaderModal] = useBinaryState(false);
    const [state, dispatch] = React.useReducer(
        (state, action) => {
            switch (action.type) {
                case 'set-form':
                    if (state.form !== action.form) {
                        return {
                            form: action.form,
                            email: state.email,
                            password: '',
                            confirmPassword: '',
                            termsAccepted: false,
                            privacyPolicyAccepted: false,
                            marketingAccepted: false,
                            error: ''
                        };
                    }
                    return state;
                case 'change-credentials':
                    return {
                        ...state,
                        error: '',
                        [action.name]: action.value
                    };
                case 'toggle-checkbox':
                    return {
                        ...state,
                        error: '',
                        [action.name]: !state[action.name]
                    };
                case 'error':
                    return {
                        ...state,
                        error: action.error
                    };
                default:
                    return state;
            }
        },
        {
            form: [LOGIN_FORM, SIGNUP_FORM].includes(queryParams.get('form')) ? queryParams.get('form') : SIGNUP_FORM,
            email: '',
            password: '',
            confirmPassword: '',
            termsAccepted: false,
            privacyPolicyAccepted: false,
            marketingAccepted: false,
            error: ''
        }
    );
    const loginWithFacebook = React.useCallback(() => {
        openLoaderModal();
        startFacebookLogin()
            .then(({ email, password }) => {
                core.transport.dispatch({
                    action: 'Ctx',
                    args: {
                        action: 'Authenticate',
                        args: {
                            type: 'Login',
                            email,
                            password,
                            facebook: true
                        }
                    }
                });
            })
            .catch((error) => {
                closeLoaderModal();
                dispatch({ type: 'error', error: error.message });
            });
    }, []);
    const loginWithApple = React.useCallback(() => {
        openLoaderModal();
        startAppleLogin()
            .then(({ token, sub, email, name }) => {
                core.transport.dispatch({
                    action: 'Ctx',
                    args: {
                        action: 'Authenticate',
                        args: {
                            type: 'Apple',
                            token,
                            sub,
                            email,
                            name
                        }
                    }
                });
            })
            .catch((error) => {
                closeLoaderModal();
                dispatch({ type: 'error', error: error.message });
            });
    }, []);
    const loginWithEmail = React.useCallback(() => {
        if (typeof state.email !== 'string' || state.email.length === 0 || !emailRef.current.validity.valid) {
            dispatch({ type: 'error', error: t('INVALID_EMAIL') });
            return;
        }
        if (typeof state.password !== 'string' || state.password.length === 0) {
            dispatch({ type: 'error', error: t('INVALID_PASSWORD') });
            return;
        }
        openLoaderModal();
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'Authenticate',
                args: {
                    type: 'Login',
                    email: state.email,
                    password: state.password
                }
            }
        });
    }, [state.email, state.password]);
    const loginAsGuest = React.useCallback(() => {
        if (!state.termsAccepted) {
            dispatch({ type: 'error', error: t('MUST_ACCEPT_TERMS') });
            return;
        }
        navigate('/');
    }, [state.termsAccepted]);
    const signup = React.useCallback(() => {
        if (typeof state.email !== 'string' || state.email.length === 0 || !emailRef.current.validity.valid) {
            dispatch({ type: 'error', error: t('INVALID_EMAIL') });
            return;
        }
        if (typeof state.password !== 'string' || state.password.length === 0) {
            dispatch({ type: 'error', error: t('INVALID_PASSWORD') });
            return;
        }
        if (state.password !== state.confirmPassword) {
            dispatch({ type: 'error', error: t('PASSWORDS_NOMATCH') });
            return;
        }
        if (!state.termsAccepted) {
            dispatch({ type: 'error', error: t('MUST_ACCEPT_TERMS') });
            return;
        }
        if (!state.privacyPolicyAccepted) {
            dispatch({ type: 'error', error: t('MUST_ACCEPT_PRIVACY_POLICY') });
            return;
        }
        openLoaderModal();
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'Authenticate',
                args: {
                    type: 'Register',
                    email: state.email,
                    password: state.password,
                    gdpr_consent: {
                        tos: state.termsAccepted,
                        privacy: state.privacyPolicyAccepted,
                        marketing: state.marketingAccepted,
                        from: 'web'
                    }
                }
            }
        });
    }, [state.email, state.password, state.confirmPassword, state.termsAccepted, state.privacyPolicyAccepted, state.marketingAccepted]);
    const emailOnChange = React.useCallback((event) => {
        dispatch({
            type: 'change-credentials',
            name: 'email',
            value: event.currentTarget.value
        });
    }, []);
    const emailOnSubmit = React.useCallback((event) => {
        event.preventDefault();
        passwordRef.current.focus();
    }, []);
    const passwordOnChange = React.useCallback((event) => {
        dispatch({
            type: 'change-credentials',
            name: 'password',
            value: event.currentTarget.value
        });
    }, []);
    const passwordOnSubmit = React.useCallback((event) => {
        if (state.form === SIGNUP_FORM) {
            event.preventDefault();
            confirmPasswordRef.current.focus();
        }
    }, [state.form]);
    const confirmPasswordOnChange = React.useCallback((event) => {
        dispatch({
            type: 'change-credentials',
            name: 'confirmPassword',
            value: event.currentTarget.value
        });
    }, []);
    const confirmPasswordOnSubmit = React.useCallback((event) => {
        event.preventDefault();
        termsRef.current.focus();
    }, []);
    const toggleTermsAccepted = React.useCallback(() => {
        dispatch({ type: 'toggle-checkbox', name: 'termsAccepted' });
    }, []);
    const togglePrivacyPolicyAccepted = React.useCallback(() => {
        dispatch({ type: 'toggle-checkbox', name: 'privacyPolicyAccepted' });
    }, []);
    const toggleMarketingAccepted = React.useCallback(() => {
        dispatch({ type: 'toggle-checkbox', name: 'marketingAccepted' });
    }, []);
    const switchForm = React.useCallback((form) => {
        const queryParams = new URLSearchParams([['form', form]]);
        setQueryParams(queryParams);
    }, []);
    const formOnSubmit = React.useCallback((event) => {
        event.preventDefault();
        state.form === SIGNUP_FORM ? signup() : loginWithEmail();
    }, [state.form, signup, loginWithEmail]);
    const cancelAuthentication = React.useCallback(() => {
        stopFacebookLogin();
        stopAppleLogin();
        closeLoaderModal();
    }, []);
    React.useEffect(() => {
        if ([LOGIN_FORM, SIGNUP_FORM].includes(queryParams.get('form'))) {
            dispatch({ type: 'set-form', form: queryParams.get('form') });
        }
    }, [queryParams]);
    React.useEffect(() => {
        if (routeFocused && typeof state.error === 'string' && state.error.length > 0) {
            errorRef.current.scrollIntoView();
        }
    }, [state.error]);
    React.useEffect(() => {
        if (routeFocused) {
            emailRef.current.focus();
        }
    }, [state.form, routeFocused]);
    React.useEffect(() => {
        const onCoreEvent = (name) => {
            if (name === 'UserAuthenticated') {
                closeLoaderModal();
                if (routeFocused) {
                    navigate('/');
                }
            }
        };
        const onCoreError = (source) => {
            if (source.event === 'UserAuthenticated') {
                closeLoaderModal();
                dispatch({
                    type: 'error',
                    error: t(state.form === SIGNUP_FORM ? 'SIGNUP_FAILED' : 'LOGIN_FAILED')
                });
            }
        };
        core.on('event', onCoreEvent);
        core.on('error', onCoreError);
        return () => {
            core.off('event', onCoreEvent);
            core.off('error', onCoreError);
        };
    }, [routeFocused, state.form]);
    return (
        <div className={styles['intro-container']}>
            <div className={styles['background-container']} />
            <div className={styles['heading-container']}>
                <div className={styles['logo-container']}>
                    <Image className={styles['logo']} src={require('/assets/images/logo.png')} alt={'Stremio'} />
                </div>
                <h1 className={styles['title-container']}>
                    {t('WEBSITE_SLOGAN_NEW_NEW')}
                </h1>
                <p className={styles['slogan-container']}>
                    {t('WEBSITE_SLOGAN_ALL')}
                </p>
            </div>
            <main className={styles['auth-card']}>
                <div className={styles['form-tabs']} role={'tablist'} aria-label={`${t('LOG_IN')} / ${t('SIGN_UP')}`}>
                    <button
                        id={'auth-login-tab'}
                        className={classnames(styles['tab-button'], { [styles['active']]: state.form === LOGIN_FORM })}
                        type={'button'}
                        role={'tab'}
                        aria-selected={state.form === LOGIN_FORM}
                        aria-controls={'auth-form-panel'}
                        onClick={() => switchForm(LOGIN_FORM)}
                    >
                        {t('LOG_IN')}
                    </button>
                    <button
                        id={'auth-signup-tab'}
                        className={classnames(styles['tab-button'], { [styles['active']]: state.form === SIGNUP_FORM })}
                        type={'button'}
                        role={'tab'}
                        aria-selected={state.form === SIGNUP_FORM}
                        aria-controls={'auth-form-panel'}
                        onClick={() => switchForm(SIGNUP_FORM)}
                    >
                        {t('SIGN_UP')}
                    </button>
                </div>
                <form
                    id={'auth-form-panel'}
                    className={styles['form-container']}
                    role={'tabpanel'}
                    aria-labelledby={state.form === SIGNUP_FORM ? 'auth-signup-tab' : 'auth-login-tab'}
                    noValidate={true}
                    onSubmit={formOnSubmit}
                >
                    <h2 id={'auth-form-title'} className={styles['form-title']}>
                        {state.form === SIGNUP_FORM ? t('SIGN_UP_EMAIL') : t('LOGIN_LABEL')}
                    </h2>
                    <div className={styles['field-container']}>
                        <label className={styles['field-label']} htmlFor={'auth-email'}>{t('EMAIL')}</label>
                        <CredentialsTextInput
                            ref={emailRef}
                            id={'auth-email'}
                            name={'email'}
                            className={styles['credentials-text-input']}
                            type={'email'}
                            autoComplete={'email'}
                            value={state.email}
                            aria-invalid={state.error.length > 0}
                            aria-describedby={state.error.length > 0 ? 'auth-error' : undefined}
                            onChange={emailOnChange}
                            onSubmit={emailOnSubmit}
                        />
                    </div>
                    <div className={styles['field-container']}>
                        <label className={styles['field-label']} htmlFor={'auth-password'}>{t('PASSWORD')}</label>
                        <CredentialsTextInput
                            ref={passwordRef}
                            id={'auth-password'}
                            name={'password'}
                            className={styles['credentials-text-input']}
                            type={'password'}
                            autoComplete={state.form === SIGNUP_FORM ? 'new-password' : 'current-password'}
                            value={state.password}
                            aria-invalid={state.error.length > 0}
                            aria-describedby={state.error.length > 0 ? 'auth-error' : undefined}
                            onChange={passwordOnChange}
                            onSubmit={passwordOnSubmit}
                        />
                    </div>
                    {
                        state.form === SIGNUP_FORM ?
                            <React.Fragment>
                                <div className={styles['field-container']}>
                                    <label className={styles['field-label']} htmlFor={'auth-confirm-password'}>{t('PASSWORD_CONFIRM')}</label>
                                    <CredentialsTextInput
                                        ref={confirmPasswordRef}
                                        id={'auth-confirm-password'}
                                        name={'confirmPassword'}
                                        className={styles['credentials-text-input']}
                                        type={'password'}
                                        autoComplete={'new-password'}
                                        value={state.confirmPassword}
                                        aria-invalid={state.error.length > 0}
                                        aria-describedby={state.error.length > 0 ? 'auth-error' : undefined}
                                        onChange={confirmPasswordOnChange}
                                        onSubmit={confirmPasswordOnSubmit}
                                    />
                                </div>
                                <div className={styles['consent-container']}>
                                    <Checkbox
                                        ref={termsRef}
                                        className={styles['consent-checkbox']}
                                        name={'termsAccepted'}
                                        label={t('READ_AND_AGREE')}
                                        link={t('TOS')}
                                        href={'https://www.stremio.com/tos'}
                                        checked={state.termsAccepted}
                                        onChange={toggleTermsAccepted}
                                    />
                                    <Checkbox
                                        ref={privacyPolicyRef}
                                        className={styles['consent-checkbox']}
                                        name={'privacyPolicyAccepted'}
                                        label={t('READ_AND_AGREE')}
                                        link={t('PRIVACY_POLICY')}
                                        href={'https://www.stremio.com/privacy'}
                                        checked={state.privacyPolicyAccepted}
                                        onChange={togglePrivacyPolicyAccepted}
                                    />
                                    <Checkbox
                                        ref={marketingRef}
                                        className={styles['consent-checkbox']}
                                        name={'marketingAccepted'}
                                        label={t('MARKETING_AGREE')}
                                        checked={state.marketingAccepted}
                                        onChange={toggleMarketingAccepted}
                                    />
                                </div>
                            </React.Fragment>
                            :
                            <button className={styles['forgot-password-link']} type={'button'} onClick={openPasswordRestModal}>
                                {t('FORGOT_PASSWORD')}
                            </button>
                    }
                    {
                        state.error && state.error.length > 0 ?
                            <div id={'auth-error'} ref={errorRef} className={styles['error-message']} role={'alert'} aria-live={'polite'}>{state.error}</div>
                            :
                            null
                    }
                    <button className={classnames(styles['form-button'], styles['submit-button'])} type={'submit'}>
                        {state.form === SIGNUP_FORM ? t('SIGN_UP') : t('LOG_IN')}
                    </button>
                </form>
                <div className={styles['divider']}>
                    <span>{t('OR')}</span>
                </div>
                <div className={styles['social-buttons']}>
                    <button className={classnames(styles['form-button'], styles['facebook-button'])} type={'button'} onClick={loginWithFacebook}>
                        <Icon className={styles['icon']} name={'facebook'} />
                        <span>{t('FB_LOGIN')}</span>
                    </button>
                    <button className={classnames(styles['form-button'], styles['apple-button'])} type={'button'} onClick={loginWithApple}>
                        <Icon className={styles['icon']} name={'macos'} />
                        <span>{t('APPLE_LOGIN')}</span>
                    </button>
                </div>
                {
                    state.form === SIGNUP_FORM ?
                        <button className={styles['guest-login-button']} type={'button'} onClick={loginAsGuest}>
                            {t('GUEST_LOGIN')}
                        </button>
                        :
                        null
                }
            </main>
            {
                passwordRestModalOpen ?
                    <PasswordResetModal email={state.email} onCloseRequest={closePasswordResetModal} />
                    :
                    null
            }
            {
                loaderModalOpen ?
                    <Modal className={styles['loading-modal-container']}>
                        <div className={styles['loader-container']}>
                            <Icon className={styles['icon']} name={'person'} />
                            <div className={styles['label']}>{t('AUTHENTICATING')}</div>
                            <button className={styles['button']} type={'button'} onClick={cancelAuthentication}>
                                {t('BUTTON_CANCEL')}
                            </button>
                        </div>
                    </Modal>
                    :
                    null
            }
        </div>
    );
};

module.exports = Intro;
