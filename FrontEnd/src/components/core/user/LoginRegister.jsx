import { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Divider, Checkbox, Card, Col, Row, Modal, Alert, Typography } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';

import Api from '../../../helpers/core/Api';
import logo from '../../../img/logo.svg';
import AuthContext, { AuthStatus } from '../../../helpers/core/AuthContext';

const { Title } = Typography;

const LoginRegister = ({ afterSignIn = () => {} }) => {
  const { t, i18n } = useTranslation();
  const { signIn, setLogged, setAuthStatus } = useContext(AuthContext);

  const MODE = {
    INIT: t('login.continue'),
    LOGIN: t('login.login'),
    REGISTER: t('login.register'),
    FORGOT_PWD: t('login.forgotPasswordBtn')
  };

  const passwordRef = useRef();

  const [loginMode, setLoginMode] = useState(MODE.INIT);
  const [emailError, setEmailError] = useState(false);
  const [pwdError, setPwdError] = useState(false);
  const [reset, setReset] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPwdOk, setForgotPwdOk] = useState(false);

  const [form] = Form.useForm();

  const handleBack = () => (loginMode === MODE.FORGOT_PWD ? setLoginMode(MODE.LOGIN) : setLoginMode(MODE.INIT));

  useEffect(() => {
    if (reset) {
      setLoginMode(MODE.INIT);
      setReset(false);
      form.resetFields();
    }
  }, [reset]);

  useEffect(() => {
    if (passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [loginMode]);

  const handleCheckEmail = email => {
    setLoading(true);
    return Api.get(`/auth/email/${email}`)
      .then(() => {
        setLoginMode(MODE.LOGIN);
      })
      .catch(err => {
        const errorCode = err.response && err.response.data ? err.response.data.error : null;
        if (errorCode === 404) {
          return setLoginMode(MODE.REGISTER);
        }
        return err?.globalHandler();
      })
      .finally(() => setLoading(false));
  };

  const handleLogin = (email, password) => {
    setLoading(true);
    return signIn(email, password, afterSignIn)
      .catch(err => {
        const errorCode = err.response && err.response.data ? err.response.data.error : null;
        if (errorCode === 300) return setEmailError(t(`core:errors.${errorCode}`));
        if (errorCode === 301) return setPwdError(t(`core:errors.${errorCode}`));

        return err?.globalHandler();
      })
      .finally(() => setLoading(false));
  };

  const handleRegister = (email, password, name, lastname, privacy) => {
    if (!privacy) {
      return setPrivacyError(t('core:errors.201'));
    }

    setLoading(true);
    return Api.post('/auth/register', {
      email,
      password,
      name,
      lastname,
      lang: i18n.language
    })
      .then(res => {
        setLogged(res.data);
        setAuthStatus(AuthStatus.SignedIn);
      })
      .catch(err => err?.globalHandler())
      .finally(() => setLoading(false));
  };

  const handleForgotPwd = email =>
    Api.post(`/auth/forgotPassword?website=true`, { email })
      .then(() => {
        setForgotPwdOk(true);
      })
      .catch(err => {
        const errorCode = err.response && err.response.data ? err.response.data.error : null;
        if (errorCode === 404) return setEmailError(t('core:errors.210'));

        return err?.globalHandler();
      });

  const handleSubmit = ({ email = '', password = '', name = '', lastname = '', privacy = false }) => {
    if (loginMode === MODE.INIT) return handleCheckEmail(email);
    if (loginMode === MODE.LOGIN) return handleLogin(email, password);
    if (loginMode === MODE.FORGOT_PWD) return handleForgotPwd(email);
    return handleRegister(email, password, name, lastname, privacy);
  };

  const validateMessages = { required: t('core:errors.201') };

  const privacyLink = () => {
    const str = t('login.privacy_check').split('%s');
    return (
      <>
        {str[0]}
        <Link to="/#">{t('login.privacy')}</Link>
        {str[1]}
      </>
    );
  };

  return navigator.cookieEnabled ? (
    <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
      <img src={logo} alt="Graniti Vicentia Logo" className="mb-5 h-[60px]" />
      <Title className="mb-6 flex items-center text-2xl">{t('login.title')}</Title>
      <Card className="w-full sm:max-w-md md:mt-0 xl:p-0">
        <Form
          id="loginForm"
          form={form}
          layout="vertical"
          requiredMark={false}
          validateMessages={validateMessages}
          onFinish={handleSubmit}
        >
          {forgotPwdOk && <Alert message={t('login.changePasswordEmailSent')} type="success" className="mb-6" />}
          <Form.Item
            name="email"
            validateTrigger="onSubmit"
            validateStatus={emailError ? 'error' : undefined}
            help={emailError || undefined}
            onChange={() => setEmailError(false)}
            rules={[
              {
                required: true
              },
              {
                type: 'email',
                message: t('core:errors.210')
              }
            ]}
          >
            <Input
              autoFocus
              addonBefore={<FontAwesomeIcon icon={faUser} />}
              readOnly={loginMode === MODE.REGISTER}
              placeholder={t('core:fields.email')}
              value={emailValue}
              onChange={value => setEmailValue(value)}
              disabled={forgotPwdOk}
            />
          </Form.Item>
          {(loginMode === MODE.LOGIN || loginMode === MODE.REGISTER) && (
            <Form.Item
              name="password"
              validateTrigger="onSubmit"
              validateStatus={pwdError ? 'error' : undefined}
              help={pwdError || undefined}
              onChange={() => setPwdError(false)}
              rules={[
                {
                  required: true
                }
              ]}
            >
              <Input.Password
                ref={passwordRef}
                addonBefore={<FontAwesomeIcon icon={faLock} />}
                placeholder={t('core:fields.password')}
              />
            </Form.Item>
          )}

          {loginMode === MODE.REGISTER && (
            <>
              <Divider />
              <Form.Item
                validateTrigger="onSubmit"
                name="name"
                rules={[
                  {
                    required: true
                  }
                ]}
              >
                <Input placeholder={t('common.name')} maxLength="128" />
              </Form.Item>

              <Form.Item
                name="lastname"
                validateTrigger="onSubmit"
                rules={[
                  {
                    required: true
                  }
                ]}
              >
                <Input placeholder={t('login.lastname')} maxLength="128" />
              </Form.Item>
              <Divider />
              <Form.Item
                name="privacy"
                valuePropName="checked"
                validateStatus={privacyError ? 'error' : undefined}
                validateTrigger="onSubmit"
                help={privacyError || undefined}
                onChange={() => setPrivacyError(false)}
                rules={[
                  {
                    required: true
                  }
                ]}
              >
                <Checkbox>{privacyLink()}</Checkbox>
              </Form.Item>
            </>
          )}

          {loginMode === MODE.LOGIN && (
            <Form.Item className="text-center">
              <Button type="link" onClick={() => setLoginMode(MODE.FORGOT_PWD)}>
                {t('login.forgotPassword')}
              </Button>
            </Form.Item>
          )}
          <Row wrap={false}>
            {loginMode !== MODE.INIT ? (
              <Col flex="none">
                <Button disabled={loading} onClick={() => handleBack()}>
                  {t('common.back')}
                </Button>
              </Col>
            ) : (
              ''
            )}
            <Col flex="auto" className="text-right">
              <Button form="loginForm" type="primary" htmlType="submit" loading={loading} disabled={loading}>
                {loginMode}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  ) : (
    Modal.error({
      title: t('cookie.title'),
      content: t('cookie.message')
    })
  );
};

export default LoginRegister;
