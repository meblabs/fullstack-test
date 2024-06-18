import { useLayoutEffect, useState } from 'react';

const getBrowserFullscreenElementProp = () => {
  if (typeof document.fullscreenElement !== 'undefined') {
    return 'fullscreenElement';
  }
  if (typeof document.mozFullScreenElement !== 'undefined') {
    return 'mozFullScreenElement';
  }
  if (typeof document.msFullscreenElement !== 'undefined') {
    return 'msFullscreenElement';
  }
  if (typeof document.webkitFullscreenElement !== 'undefined') {
    return 'webkitFullscreenElement';
  }
  throw new Error('fullscreenElement is not supported by this browser');
};

export default function useFullscreenStatus(elRef) {
  const [isFullscreen, setIsFullscreen] = useState(document[getBrowserFullscreenElementProp()] != null);

  const setFullscreen = (enable = true) => {
    if (elRef.current == null) return;
    if (!enable) {
      document.exitFullscreen();
    } else {
      elRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(document[getBrowserFullscreenElementProp()] != null);
        })
        .catch(() => {
          setIsFullscreen(false);
        });
    }
  };

  useLayoutEffect(() => {
    document.onfullscreenchange = () => setIsFullscreen(document[getBrowserFullscreenElementProp()] != null);

    return () => {
      document.onfullscreenchange = undefined;
    };
  });

  return [isFullscreen, setFullscreen];
}
