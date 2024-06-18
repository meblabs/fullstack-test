import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Result, Button } from 'antd';
import { useTranslation } from 'react-i18next';

const ErrorPage = props => {
  const status = props.status ? props.status : '404';
  const { t } = useTranslation();

  return (
    <Result
      status={status}
      title={t(`core:${status}.title`)}
      subTitle={t(`core:${status}.text`)}
      extra={
        <Link to="/">
          <Button type="primary">{t(`core:${status}.link`)}</Button>
        </Link>
      }
    />
  );
};

export default memo(ErrorPage);
