import { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Card, Col, Row, Modal, Alert, Typography } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';

import Api from '../../../helpers/core/Api';
import AuthContext from '../../../helpers/core/AuthContext';

import logo from '../../../img/logo.svg';

const { Title } = Typography;

const Login = () => {
  const { t } = useTranslation();
  const { signIn } = useContext(AuthContext);

  const MODE = { LOGIN: t('login.login'), FORGOT_PWD: t('login.forgotPasswordBtn') };

  const [loginMode, setLoginMode] = useState(MODE.LOGIN);

  const [emailError, setEmailError] = useState(false);
  const [pwdError, setPwdError] = useState(false);
  const [forgotPwdOk, setForgotPwdOk] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    setEmailError(false);
    setPwdError(false);
    setForgotPwdOk(false);
  }, [loginMode]);

  const handleSubmit = ({ email = '', password = '' }) => {
    if (loginMode === MODE.LOGIN) {
      return signIn(email, password).catch(err => {
        const errorCode = err.response && err.response.data ? err.response.data.error : null;
        if (errorCode === 300) return setEmailError(t(`core:errors.${errorCode}`));
        if (errorCode === 301) return setPwdError(t(`core:errors.${errorCode}`));

        return err?.globalHandler();
      });
    }

    return Api.post(`/auth/forgotPassword`, { email })
      .then(() => {
        setForgotPwdOk(true);
      })
      .catch(err => {
        const errorCode = err.response && err.response.data ? err.response.data.error : null;
        if (errorCode === 404) return setEmailError(t('core:errors.210'));

        return err?.globalHandler();
      });
  };

  const validateMessages = { required: t('core:errors.201') };

  return navigator.cookieEnabled ? (
    <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
      <img src={logo} alt="Logo" id="logo" className="2 mb-4 h-14 w-auto" />
      <Title className="mb-6 flex items-center text-2xl">
        {t('login.title', { project: import.meta.env.VITE_NAME })}
      </Title>
      <Card className="w-full sm:max-w-md md:mt-0 xl:p-0">
        <Form
          id="loginForm"
          form={form}
          layout="vertical"
          requiredMark={false}
          validateMessages={validateMessages}
          onFinish={handleSubmit}
          validateTrigger="onSubmit"
        >
          {forgotPwdOk && <Alert message={t('login.changePasswordEmailSent')} type="success" className="mb-6" />}
          <Form.Item
            name="email"
            validateStatus={emailError ? 'error' : undefined}
            help={emailError || undefined}
            onChange={() => setEmailError(false)}
            rules={[
              {
                required: true,
                type: 'email',
                message: t('core:errors.210')
              }
            ]}
          >
            <Input
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              addonBefore={<FontAwesomeIcon icon={faUser} />}
              placeholder={t('core:fields.email')}
              disabled={forgotPwdOk}
            />
          </Form.Item>
          {loginMode === MODE.LOGIN && (
            <Form.Item
              name="password"
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
                name="current-password"
                autoComplete="current-password"
                type="password"
                addonBefore={<FontAwesomeIcon icon={faLock} />}
                placeholder={t('core:fields.password')}
              />
            </Form.Item>
          )}

          {loginMode !== MODE.FORGOT_PWD ? (
            <Form.Item className="text-center">
              <Button type="link" onClick={() => setLoginMode(MODE.FORGOT_PWD)}>
                {t('login.forgotPassword')}
              </Button>
            </Form.Item>
          ) : (
            ''
          )}

          <Row wrap={false}>
            {loginMode !== MODE.LOGIN ? (
              <Col flex="none">
                <Button onClick={() => setLoginMode(MODE.LOGIN)}>{t('common.back')}</Button>
              </Col>
            ) : (
              ''
            )}
            <Col flex="auto" className="text-right">
              <Button form="loginForm" type="primary" htmlType="submit">
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

export default Login;
