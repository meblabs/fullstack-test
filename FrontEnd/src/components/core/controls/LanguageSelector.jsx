import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { FlagIcon } from 'react-flag-kit';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const { language } = i18n;

  const changeLanguage = lang => i18n.changeLanguage(lang);

  return (
    <Select type="text" defaultValue={language} value={language} onChange={changeLanguage}>
      <Select.Option value="it">
        <FlagIcon code="IT" size={14} className="mb-1 w-5" />
      </Select.Option>
      <Select.Option value="en">
        <FlagIcon code="GB" size={14} className="mb-1 w-5" />
      </Select.Option>
    </Select>
  );
};

export default LanguageSelector;
