import { useLayoutEffect } from 'react';

const useOnResize = (handleResize, debounce = 300) => {
  useLayoutEffect(() => {
    let timeout;
    const onResize = d => {
      clearTimeout(timeout);
      timeout = setTimeout(() => handleResize(), d);
    };

    window.addEventListener('resize', () => onResize(debounce));
    onResize(0);

    return () => window.removeEventListener('resize', onResize);
  }, []);
};

export default useOnResize;
