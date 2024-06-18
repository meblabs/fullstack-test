/* eslint-disable max-len */
import { useContext, memo } from 'react';
import { Drawer, Button, Row, Col } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

import UserInfo from '../user/UserInfo';
import LanguageSelector from '../controls/LanguageSelector';
import Menu from './Menu';
import AuthContext from '../../../helpers/core/AuthContext';

const MobileDrawer = props => {
  const { show, close } = props;
  const { logged, signOut } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <Drawer
      className="z-50"
      title={
        <div className="float-right">
          <UserInfo user={logged} link={false} />
        </div>
      }
      placement="left"
      width="90vw"
      onClose={() => close()}
      open={show}
      styles={{ body: { padding: 0 } }}
    >
      <div className="flex h-full flex-col p-4">
        <div className="flex-auto">
          <Menu />
        </div>
        <div className="landscape:hidden">
          <Row>
            <Col flex="none">
              <LanguageSelector />
            </Col>
            <Col flex="auto" className="text-right">
              <Button
                type="primary"
                shape="circle"
                icon={<FontAwesomeIcon icon={faPowerOff} />}
                onClick={() => signOut(() => navigate('/', { intended: '/' }))}
              />
            </Col>
          </Row>
        </div>
      </div>
    </Drawer>
  );
};

export default memo(MobileDrawer);
