/* eslint-disable react/jsx-props-no-spreading */
import { Typography } from 'antd';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImageSlash } from '@fortawesome/free-solid-svg-icons';

import Image from '../controls/Image';

import '../../../styles/core/components/TableImage.css';

const { Text } = Typography;

const TableImage = ({ url, aspectRatio = '1:1', link = false, ...props }) => {
  const image = url ? (
    <Image src={url} preview={false} aspectRatio={aspectRatio} {...props} />
  ) : (
    <div className="table-image-empty bg-gray-200 dark:bg-gray-800">
      <Text type="secondary">
        <FontAwesomeIcon icon={faImageSlash} />
      </Text>
    </div>
  );

  return link ? <Link to={link}>{image}</Link> : image;
};

export default TableImage;
