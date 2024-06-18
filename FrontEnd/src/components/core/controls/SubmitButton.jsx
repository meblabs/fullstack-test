/* eslint-disable prefer-arrow-callback */
/* eslint-disable react/jsx-props-no-spreading */
import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button } from 'antd';

const SubmitButton = forwardRef(function SubmitButton({ children, ...props }, ref) {
  const [loading, setLoading] = useState(false);
  const btnRef = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      loading(v) {
        setLoading(v);
      }
    }),
    []
  );

  return (
    <Button {...props} loading={loading} ref={btnRef} htmlType="submit">
      {children}
    </Button>
  );
});

export default SubmitButton;
