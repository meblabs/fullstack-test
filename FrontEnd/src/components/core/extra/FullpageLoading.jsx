import { memo } from 'react';
import { Spin } from 'antd';

const FullpageLoading = () => (
  <div className="mx-auto flex h-screen flex-col items-center justify-center px-6 py-8 lg:py-0">
    <Spin />
  </div>
);

export default memo(FullpageLoading);
