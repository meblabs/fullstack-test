import { Button, Space } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Api from '../../../helpers/core/Api';

const ForgotPasswordPopover = ({ email }) => {
  const { t } = useTranslation();
  const [textValue, setTextValue] = useState(t('login.sureToChangePassword'));
  const [showButton, setShowButton] = useState(true);

  const handleYes = () =>
    Api.post(`/auth/forgotPassword`, { email })
      .then(() => {
        setTextValue(t('login.changePasswordEmailSent'));
        setShowButton(false);
      })
      .catch(err => err?.globalHandler());

  return (
    <Space direction="vertical">
      <p className="mb-0">{textValue}</p>
      {showButton && (
        <div className="text-right">
          <Button type="primary" onClick={() => handleYes()}>
            {t('common.yes')}
          </Button>
        </div>
      )}
    </Space>
  );
};

export default ForgotPasswordPopover;
