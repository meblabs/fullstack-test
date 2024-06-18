import { useState, useContext } from 'react';
import { Layout, theme } from 'antd';
import Sticky from 'react-stickynode';

import Menu from './Menu';
import AppContext from '../../../helpers/AppContext';

const { useToken } = theme;

const { Sider } = Layout;

const Sidebar = props => {
  const { darkMode } = useContext(AppContext);
  const { token } = useToken();

  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sider
      breakpoint="lg"
      theme={darkMode ? 'dark' : 'light'}
      style={{ backgroundColor: token.colorBgContainer, borderRight: '1px solid ' + token.colorBorder }}
      collapsible
      collapsed={collapsed}
      onCollapse={value => setCollapsed(value)}
    >
      <Sticky top="#topbar">
        <Menu />
      </Sticky>
    </Sider>
  );
};

export default Sidebar;
