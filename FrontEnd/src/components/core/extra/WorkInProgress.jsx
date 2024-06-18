import { memo } from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const WorkInProgress = ({ noBack = false }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Result
      title="Work In Progress"
      subTitle="This page will be available soon!"
      extra={
        !noBack && (
          <Button type="primary" onClick={() => navigate(-1)}>
            {t('common.back')}
          </Button>
        )
      }
    />
  );
};

export default memo(WorkInProgress);
