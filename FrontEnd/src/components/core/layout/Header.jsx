/* eslint-disable no-nested-ternary */
import { useState, useContext, memo } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Button, Row, Col, theme } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

import AppContext from '../../../helpers/AppContext';
import UserInfo from '../user/UserInfo';
import LoggedDropdownButton from '../user/LoggedDropdownButton';

import logo from '../../../img/logo.svg';

import MobileDrawer from './MobileDrawer';
import AuthContext from '../../../helpers/core/AuthContext';

const { useToken } = theme;

const { Header } = Layout;

const HeaderComponent = props => {
  const { logged } = useContext(AuthContext);
  const { isMobile } = useContext(AppContext);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const { token } = useToken();

  return (
    <>
      <Header
        id="topbar"
        style={{ backgroundColor: token.colorBgContainer, borderBottom: '1px solid ' + token.colorBorder }}
        className="sticky top-0 z-50 h-16 px-4"
      >
        <Row className="h-full" wrap={false} align="middle">
          {isMobile ? (
            <>
              <Col flex="none">
                <Link to="/">
                  <img src={logo} alt="Logo" id="logo" className="block h-10 w-auto" />
                </Link>
              </Col>
              <Col flex="auto">
                <div className="flex items-center justify-end space-x-1">
                  <UserInfo user={logged} noText link={false} />
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<FontAwesomeIcon icon={faBars} />}
                    onClick={() => setShowMobileDrawer(true)}
                  />
                </div>
              </Col>
            </>
          ) : (
            <>
              <Col flex="none">
                <Link to="/">
                  <img src={logo} alt="Logo" id="logo" className="block h-10 w-auto" />
                </Link>
              </Col>
              <Col flex="auto" className="px-4" />
              <Col flex="none">
                <LoggedDropdownButton />
              </Col>
            </>
          )}
        </Row>
      </Header>
      {isMobile && <MobileDrawer show={showMobileDrawer} close={() => setShowMobileDrawer(false)} />}
    </>
  );
};

export default memo(HeaderComponent);
