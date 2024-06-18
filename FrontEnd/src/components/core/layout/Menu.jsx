import { useContext } from 'react';
import { Menu, theme } from 'antd';
import AppContext from '../../../helpers/AppContext';

const { useToken } = theme;

const CpMenu = () => {
  const { menuItems, setSelectedMenuItem, selectedMenuItem, macroMenuSelection } = useContext(AppContext);
  const { token } = useToken();

  return (
    <Menu
      mode="inline"
      style={{ backgroundColor: token.colorBgContainer, borderWidth: 0 }}
      items={menuItems[macroMenuSelection].map(e => {
        const tmpObj = { ...e };
        delete tmpObj?.authorizedRoles;
        return tmpObj;
      })}
      selectedKeys={selectedMenuItem}
      onSelect={data => setSelectedMenuItem(data.key)}
    />
  );
};

export default CpMenu;
