import { useContext } from 'react';
import { ConfigProvider, theme, App } from 'antd';

import AppContext from '../AppContext';
import { light, dark } from '../../theme/ant.config';

const { defaultAlgorithm, darkAlgorithm } = theme;

const ThemeProvider = ({ children }) => {
  const { darkMode } = useContext(AppContext);

  if (darkMode) document.body.classList.add('dark');
  else document.body.classList.remove('dark');

  return (
    <ConfigProvider theme={{ algorithm: darkMode ? darkAlgorithm : defaultAlgorithm, ...(darkMode ? dark : light) }}>
      <App>{children}</App>
    </ConfigProvider>
  );
};

export default ThemeProvider;
