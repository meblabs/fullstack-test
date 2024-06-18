/* eslint-disable react/jsx-props-no-spreading */
import { useEffect, useState } from 'react';
import { Image as AntImage, Typography } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import fallbackImage from '../../../img/notFoundFullHd.png';

import '../../../styles/core/components/Image.css';

const { Text } = Typography;

const ImageComponent = ({ src, maxRetries = 5, retryDelay = 1000, aspectRatio = '16:9', ...props }) => {
  const [firstCheck, setFirstCheck] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [aspectRatioClass, setAspectRatioClass] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;

    const handleImageLoad = () => {
      setIsLoading(false);
      setFirstCheck(true);
    };

    const handleImageError = () => {
      setFirstCheck(true);
      if (retryCount < maxRetries) {
        const delay = Math.min(retryDelay * 2 ** retryCount, 10000); // il delay raddoppia ad ogni tentativo fino a 10 secondi
        setTimeout(() => {
          img.src = src;
          setRetryCount(retryCount + 1);
        }, delay);
      } else {
        setIsLoading(false);
      }
    };

    img.addEventListener('load', handleImageLoad);
    img.addEventListener('error', handleImageError);

    return () => {
      img.removeEventListener('load', handleImageLoad);
      img.removeEventListener('error', handleImageError);
    };
  }, [src, maxRetries, retryDelay, retryCount]);

  useEffect(() => {
    switch (aspectRatio) {
      case '16:9':
        setAspectRatioClass('image-container-16-9');
        break;
      case '1:1':
        setAspectRatioClass('image-container-1-1');
        break;
      case '4:3':
        setAspectRatioClass('image-container-4-3');
        break;
      default:
        setAspectRatioClass(null);
    }
  }, []);

  if (!firstCheck) return false;

  return (
    <div className={`image-container ${aspectRatioClass || ''}`}>
      {isLoading ? (
        <div className="loading-image bg-gray-200 dark:bg-gray-800">
          <Text type="secondary">
            <FontAwesomeIcon icon={faSpinner} spin />
          </Text>
        </div>
      ) : (
        <AntImage src={src} {...props} fallback={fallbackImage} />
      )}
    </div>
  );
};

export default ImageComponent;
