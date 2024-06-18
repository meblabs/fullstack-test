import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import itLocale from 'i18n-iso-countries/langs/it.json';
import { FlagIcon } from 'react-flag-kit';

const CountrySelect = ({ value = '', onChange, className, limit }) => {
  const { i18n } = useTranslation();
  const { language } = i18n;

  countries.registerLocale(enLocale);
  countries.registerLocale(itLocale);

  const countryObj = countries.getNames(language, { select: 'official' });

  const options = Object.entries(countryObj)
    .map(([k, v]) => ({
      value: k,
      label: v
    }))
    .filter(o => {
      if (limit) {
        return limit.map(l => l.toUpperCase()).includes(o.value);
      }
      return true;
    })
    .sort((a, b) => {
      if (limit) {
        // eslint-disable-next-line no-nested-ternary
        return a.label.toLowerCase() < b.label.toLowerCase()
          ? -1
          : a.label.toLowerCase() > b.label.toLowerCase()
            ? 1
            : 0;
      }
      return true;
    });

  const filterHandler = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  return (
    <Select
      virtual={false}
      className={className}
      showSearch
      value={value}
      optionFilterProp="children"
      filterOption={filterHandler}
      onChange={v => onChange(v)}
    >
      {options.map(item => (
        <Select.Option key={item.value} value={item.value}>
          <div className="flex items-center space-x-1">
            <FlagIcon code={item.value} size={16} className="w-5" />
            <span>{item.label}</span>
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};

export default CountrySelect;
