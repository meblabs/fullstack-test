import { useState } from 'react';

const useLocalStorage = (key, initValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initValue;
    } catch (err) {
      return initValue;
    }
  });

  const setStoredValue = newValue => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('useLocalStorage error: ', error);
    }
  };

  return [value, setStoredValue];
};

export default useLocalStorage;
