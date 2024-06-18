import { useState } from 'react';

const useUserAgent = () => {
  const userAgent = useState(navigator.userAgent || navigator.vendor || window.opera);
  const getDevice = () => {
    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
      return 'Windows Phone';
    }

    if (/android/i.test(userAgent)) {
      return 'Android';
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return 'iOS';
    }

    return 'unknown';
  };

  return {
    getDevice,
    isIOS: getDevice() === 'iOS',
    isAndroid: getDevice() === 'Android',
    isWindowsPhone: getDevice() === 'Windows Phone',
    isUnkown: getDevice() === 'unknown'
  };
};

export default useUserAgent;
