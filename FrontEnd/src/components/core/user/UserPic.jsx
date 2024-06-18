/* eslint-disable react/jsx-props-no-spreading */
import { useEffect, useState, useContext, memo } from 'react';
import { Avatar, Skeleton, Tooltip, theme } from 'antd';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import AuthContext from '../../../helpers/core/AuthContext';
import Api from '../../../helpers/core/Api';

const { useToken } = theme;

const UserPic = props => {
  const { user, size, link, loadPic, ...spreadProps } = props;
  const { logged } = useContext(AuthContext);
  const [info, setInfo] = useState(null);
  const { token } = useToken();

  useEffect(() => {
    if (user) {
      if (user.id === undefined) user.id = user._id;

      if (logged?.id === user.id) {
        setInfo(logged);
      } else if (!user.picUrl && loadPic) {
        Api.get('/users/' + user.id + '/pic')
          .then(res => {
            setInfo({ ...user, picUrl: res.data });
          })
          .catch(setInfo(user));
      } else {
        setInfo(user);
      }
    }
  }, [user]);

  const el = info ? (
    <Tooltip title={info.fullname} placement="top">
      <Avatar
        {...spreadProps}
        size={size}
        style={{ backgroundColor: token.colorPrimary }}
        icon={<FontAwesomeIcon icon={faUser} fontSize={typeof size === 'number' ? size / 2 : 14} />}
        src={info.picUrl}
        alt={info.fullname}
      />
    </Tooltip>
  ) : (
    <Skeleton.Avatar active size={size} />
  );

  if (link && info) {
    return <Link to={'/profile/' + info.id}>{el}</Link>;
  }

  return <span>{el}</span>;
};

export default memo(UserPic);
