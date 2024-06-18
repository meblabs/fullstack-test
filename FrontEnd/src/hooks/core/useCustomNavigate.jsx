import { useNavigate } from 'react-router-dom';

const useCustomNavigate = () => {
  const navigate = useNavigate();

  return (url, event = {}) => {
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      window.open(url, '_blank');
    } else {
      navigate(url);
    }
  };
};

export default useCustomNavigate;
