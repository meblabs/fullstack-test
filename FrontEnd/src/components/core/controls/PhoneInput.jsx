import { Input, Select } from 'antd';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { FlagIcon } from 'react-flag-kit';
import i18nCountries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import itLocale from 'i18n-iso-countries/langs/it.json';

let prefixes = {};

const PhoneInput = ({
  onChange,
  onBlur,
  value,
  disabled,
  loading,
  countries,
  placeholder,
  defaultCountry,
  showSearch = true,
  selectClasses = 'w-auto'
}) => {
  const { i18n } = useTranslation();
  const { language } = i18n;
  const [backupValue, setBackupValue] = useState({});

  i18nCountries.registerLocale(enLocale);
  i18nCountries.registerLocale(itLocale);

  const countryObj = i18nCountries.getNames(language, { select: 'official' });

  const availablePrefixes = useMemo(
    () =>
      !countries
        ? prefixes
        : Object.keys(prefixes).reduce((result, key) => {
            if (countries.map(c => c.toUpperCase()).includes(key)) {
              // eslint-disable-next-line no-param-reassign
              result[key] = prefixes[key];
            }
            return result;
          }, {}),
    [countries]
  );

  const handlePrefixChange = countryCode => {
    if (value?.number) {
      onChange({ country: countryCode, prefix: availablePrefixes[countryCode], number: value?.number });
    } else {
      setBackupValue({ country: countryCode, prefix: availablePrefixes[countryCode], number: '' });
      onChange(null);
    }
  };

  const handleNumberChange = newNumber => {
    const reg = /^-?[0-9]*(\.[0-9]*)?$/;
    if (reg.test(newNumber)) {
      if (newNumber.length > 0) {
        onChange({
          country: backupValue.country || value?.country,
          prefix: backupValue.prefix || value?.prefix,
          number: newNumber
        });
        setBackupValue({});
      } else {
        setBackupValue({ country: value?.country, prefix: value?.prefix, number: '' });
        onChange(null);
      }
    }
  };

  useEffect(() => {
    if (!value) {
      const browserLocale = navigator.language.split('-')[1] ?? Object.values(availablePrefixes)[0];
      setBackupValue({
        country: defaultCountry || browserLocale,
        prefix: availablePrefixes[defaultCountry || browserLocale],
        number: ''
      });
    } else {
      setBackupValue({});
    }
  }, []);

  useEffect(() => {
    if (value?.formatted) {
      onChange({ country: value?.country, prefix: value?.prefix, number: value?.number });
    }
    if (value) {
      setBackupValue({});
    }
  }, [value]);

  const renderOption = (v, label = false) => (
    <div className="flex items-center space-x-1">
      <FlagIcon code={v} size={16} className="w-5" />
      <span>{availablePrefixes[v]}</span>
      {label ? <span className="text-secondary">{countryObj[v]}</span> : ''}
    </div>
  );

  const selectBefore = (
    <Select
      popupMatchSelectWidth={false}
      showSearch={showSearch}
      className={selectClasses}
      optionFilterProp="children"
      onChange={handlePrefixChange}
      filterOption={(input, option) => option.country.toLowerCase().indexOf(input.toLowerCase()) >= 0}
      filterSort={(optionA, optionB) => optionA.country.toLowerCase().localeCompare(optionB.country.toLowerCase())}
      value={backupValue?.country || value?.country}
      disabled={disabled || Object.entries(availablePrefixes).length === 1}
      defaultValue={defaultCountry || Object.keys(availablePrefixes)[0]}
      loading={loading}
      onBlur={onBlur}
      labelRender={props => renderOption(props.value, false)}
      optionRender={props => renderOption(props.value, true)}
      options={Object.keys(availablePrefixes).map(countryCode => ({
        value: countryCode,
        label: availablePrefixes[countryCode],
        country: countryObj[countryCode]
      }))}
    />
  );

  return (
    <Input
      addonBefore={selectBefore}
      style={{ width: '100%' }}
      placeholder={placeholder}
      onChange={e => handleNumberChange(e.target.value)}
      value={value?.number || ''}
      disabled={disabled}
    />
  );
};

export const PhoneValidator = {
  validator: (_, data) => {
    if (!data) return Promise.resolve();
    if (data?.number?.length > 0 && !/^\d+$/.test(data?.number)) return Promise.reject(new Error(t('core:errors.211')));
    if (data?.number?.length > 0 && data?.number?.length < 6) return Promise.reject(new Error(t('core:errors.211')));
    if (data?.number?.length > 11) return Promise.reject(new Error(t('core:errors.211')));
    return Promise.resolve();
  }
};
export default PhoneInput;

prefixes = {
  BR: '+55',
  BS: '+1-242',
  JE: '+44-1534',
  BY: '+375',
  BZ: '+501',
  RU: '+7',
  RW: '+250',
  RS: '+381',
  TL: '+670',
  RE: '+262',
  TM: '+993',
  TJ: '+992',
  RO: '+40',
  TK: '+690',
  GW: '+245',
  GU: '+1-671',
  GT: '+502',
  GS: '+500',
  GR: '+30',
  GQ: '+240',
  GP: '+590',
  JP: '+81',
  GY: '+592',
  GG: '+44-1481',
  GF: '+594',
  GE: '+995',
  GD: '+1-473',
  GB: '+44',
  GA: '+241',
  SV: '+503',
  GN: '+224',
  GM: '+220',
  GL: '+299',
  GI: '+350',
  GH: '+233',
  OM: '+968',
  TN: '+216',
  JO: '+962',
  HR: '+385',
  HT: '+509',
  HU: '+36',
  HK: '+852',
  HN: '+504',
  HM: '+672',
  VE: '+58',
  PS: '+970',
  PW: '+680',
  PT: '+351',
  SJ: '+47',
  PY: '+595',
  IQ: '+964',
  PA: '+507',
  PF: '+689',
  PG: '+675',
  PE: '+51',
  PK: '+92',
  PH: '+63',
  PN: '+870',
  PL: '+48',
  PM: '+508',
  ZM: '+260',
  EE: '+372',
  EG: '+20',
  ZA: '+27',
  EC: '+593',
  IT: '+39',
  VN: '+84',
  SB: '+677',
  ET: '+251',
  SO: '+252',
  ZW: '+263',
  SA: '+966',
  ES: '+34',
  ER: '+291',
  ME: '+382',
  MD: '+373',
  MG: '+261',
  MF: '+590',
  MA: '+212',
  MC: '+377',
  UZ: '+998',
  MM: '+95',
  ML: '+223',
  MO: '+853',
  MN: '+976',
  MH: '+692',
  MK: '+389',
  MU: '+230',
  MT: '+356',
  MW: '+265',
  MV: '+960',
  MQ: '+596',
  MP: '+1-670',
  MS: '+1-664',
  MR: '+222',
  IM: '+44-1624',
  UG: '+256',
  TZ: '+255',
  MY: '+60',
  MX: '+52',
  IL: '+972',
  FR: '+33',
  IO: '+246',
  SH: '+290',
  FI: '+358',
  FJ: '+679',
  FK: '+500',
  FM: '+691',
  FO: '+298',
  NI: '+505',
  NL: '+31',
  NO: '+47',
  NA: '+264',
  VU: '+678',
  NC: '+687',
  NE: '+227',
  NF: '+672',
  NG: '+234',
  NZ: '+64',
  NP: '+977',
  NR: '+674',
  NU: '+683',
  CK: '+682',
  XK: '+383',
  CI: '+225',
  CH: '+41',
  CO: '+57',
  CN: '+86',
  CM: '+237',
  CL: '+56',
  CC: '+61',
  CA: '+1',
  CG: '+242',
  CF: '+236',
  CD: '+243',
  CZ: '+420',
  CY: '+357',
  CX: '+61',
  CR: '+506',
  CW: '+599',
  CV: '+238',
  CU: '+53',
  SZ: '+268',
  SY: '+963',
  SX: '+599',
  KG: '+996',
  KE: '+254',
  SS: '+211',
  SR: '+597',
  KI: '+686',
  KH: '+855',
  KN: '+1-869',
  KM: '+269',
  ST: '+239',
  SK: '+421',
  KR: '+82',
  SI: '+386',
  KP: '+850',
  KW: '+965',
  SN: '+221',
  SM: '+378',
  SL: '+232',
  SC: '+248',
  KZ: '+7',
  KY: '+1-345',
  SG: '+65',
  SE: '+46',
  SD: '+249',
  DM: '+1-767',
  DJ: '+253',
  DK: '+45',
  VG: '+1-284',
  DE: '+49',
  YE: '+967',
  DZ: '+213',
  US: '+1',
  UY: '+598',
  YT: '+262',
  UM: '+1',
  LB: '+961',
  LC: '+1-758',
  LA: '+856',
  TV: '+688',
  TW: '+886',
  TT: '+1-868',
  TR: '+90',
  LK: '+94',
  LI: '+423',
  LV: '+371',
  TO: '+676',
  LT: '+370',
  LU: '+352',
  LR: '+231',
  LS: '+266',
  TH: '+66',
  TF: '+33',
  TG: '+228',
  TD: '+235',
  TC: '+1-649',
  LY: '+218',
  VA: '+379',
  VC: '+1-784',
  AE: '+971',
  AD: '+376',
  AG: '+1-268',
  AF: '+93',
  AI: '+1-264',
  VI: '+1-340',
  IS: '+354',
  IR: '+98',
  AM: '+374',
  AL: '+355',
  AO: '+244',
  AS: '+1-684',
  AR: '+54',
  AU: '+61',
  AT: '+43',
  AW: '+297',
  IN: '+91',
  AX: '+358-18',
  AZ: '+994',
  IE: '+353',
  ID: '+62',
  UA: '+380',
  QA: '+974',
  MZ: '+258'
};
