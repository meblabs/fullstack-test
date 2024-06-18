/* eslint-disable no-nested-ternary */
import { useState, useEffect } from 'react';
import { Tag } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSync, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

import Api from '../../../helpers/core/Api';

const APICheck = props => {
  const [message, setMessage] = useState('Loading...');
  const [check, setCheck] = useState(0);

  useEffect(() => {
    Api.get('/')
      .then(res => {
        setMessage(res.data.message);
        setCheck(1);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
        setCheck(-1);
      });
  }, []);

  const icon =
    check === 1 ? (
      <FontAwesomeIcon icon={faCheckCircle} />
    ) : check === 0 ? (
      <FontAwesomeIcon icon={faSync} />
    ) : (
      <FontAwesomeIcon icon={faExclamationCircle} />
    );
  const color = check === 1 ? 'success' : check === 0 ? 'processing' : 'error';

  return (
    <div className="api-check">
      <Tag icon={icon} color={color}>
        {message}
      </Tag>
    </div>
  );
};

export default APICheck;
