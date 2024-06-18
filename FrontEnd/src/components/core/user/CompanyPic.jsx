/* eslint-disable react/jsx-props-no-spreading */
import { useEffect, useState, useContext, memo } from 'react';
import { Avatar, Skeleton, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';

import AuthContext from '../../../helpers/core/AuthContext';
import Api from '../../../helpers/core/Api';
import stringToColor from '../../../helpers/core/stringToColor';

const CompanyPic = props => {
  const { company, size, link, loadPic, ...spreadProps } = props;
  const { logged } = useContext(AuthContext);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (company) {
      if (company.id === undefined) company.id = company._id;

      if (logged?.company?.id === company.id && !loadPic) {
        setInfo(logged.company);
      } else if (!company.picUrl && loadPic) {
        Api.get('/companies/' + company.id + '/pic')
          .then(res => {
            setInfo({ ...company, picUrl: res.data });
          })
          .catch(setInfo(company));
      } else {
        setInfo(company);
      }
    }
  }, [company]);

  const el = info ? (
    <Tooltip title={info.name} placement="top">
      <Avatar
        {...spreadProps}
        size={size}
        style={{ backgroundColor: stringToColor(info.name) }}
        icon={<FontAwesomeIcon icon={faBuilding} fontSize={typeof size === 'number' ? size / 2 : 14} />}
        src={info.picUrl}
        alt={info.name}
      />
    </Tooltip>
  ) : (
    <Skeleton.Avatar active size={size} />
  );

  if (link && info) {
    return <Link to={'/company/profile/' + info.id}>{el}</Link>;
  }

  return <span>{el}</span>;
};

export default memo(CompanyPic);
