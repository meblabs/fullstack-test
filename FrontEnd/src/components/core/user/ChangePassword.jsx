import { useState, useContext, useEffect } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Api from '../../../helpers/core/Api';

import AuthContext from '../../../helpers/core/AuthContext';

const { Title } = Typography;

const ChangePassword = () => {
  const { t } = useTranslation();
  const { email, token } = useParams();
  const { signIn } = useContext(AuthContext);
  const [feedback, setFeedback] = useState(null);
  const [form] = Form.useForm();

  const handleSubmit = ({ password, confirm }) => {
    if (password !== confirm) {
      return setFeedback(t('login.passwordNotMatch'));
    }
    return Api.patch(`/auth/changePassword/${email}/${token}`, { password })
      .then(() => signIn(email, password))
      .catch(err => err?.globalHandler());
  };

  useEffect(() => {
    form.setFieldValue('email', email);
  }, [email]);

  return (
    <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
      <Title className="mb-6 flex items-center text-2xl">{t('login.forgotPasswordTitle')}</Title>
      <Card className="w-full sm:max-w-md md:mt-0 xl:p-0">
        <Form onFinish={data => handleSubmit(data)} layout="vertical" form={form}>
          <section className="hidden">
            <Form.Item label="email" name="email">
              <Input type="email" name="email" />
            </Form.Item>
          </section>

          <Form.Item
            label={t('core:fields.password')}
            name="password"
            validateStatus={feedback ? 'error' : undefined}
            help={feedback || undefined}
            onChange={() => setFeedback(false)}
            rules={[{ required: true, message: t('core:fields.missingPassword') }]}
          >
            <Input.Password name="new-password" autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            label={t('core:fields.confirmPassword')}
            name="confirm"
            onChange={() => setFeedback(false)}
            rules={[{ required: true, message: t('core:fields.missingPasswordConfirmation') }]}
          >
            <Input.Password name="new-password" autoComplete="new-password" />
          </Form.Item>
          <div className="text-right">
            <Button type="primary" htmlType="submit">
              {t('common.confirm')}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};
export default ChangePassword;
