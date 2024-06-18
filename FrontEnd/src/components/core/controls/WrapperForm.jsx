/* eslint-disable react/jsx-props-no-spreading */
import { useContext } from 'react';
import { Form } from 'antd';

import MessageContext from '../../../helpers/core/MessageContext';

const WrapperForm = ({ children, onSubmit, submitBtn, ...props }) => {
  const { loadingMsg, savedMsg, errorMsg } = useContext(MessageContext);

  const onFinish = data => {
    const msg = loadingMsg();

    submitBtn.current.loading(true);

    return onSubmit(data)
      .then(() => {
        submitBtn.current?.loading(false);
        savedMsg(msg);
      })
      .catch(err => {
        submitBtn.current?.loading(false);
        errorMsg(msg, err);
      });
  };

  return (
    <Form onFinish={onFinish} {...props}>
      {children}
    </Form>
  );
};

export default WrapperForm;
