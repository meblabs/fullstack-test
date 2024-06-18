import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { classNames } from '../../../helpers/core/utils';

const prepareDays = length =>
  Array.from({ length }, (_, i) => {
    const d = i + 1;
    return { label: d, value: d };
  });

const HorizontalDatePicker = ({ onChange, value, only = false, limit = 0, inverted = true }) => {
  const [years, setYears] = useState([]);
  const [innerDate, setInnerDate] = useState({ year: null, month: null, day: null });
  const { t } = useTranslation();
  const [daysInMonth, setDaysInMonth] = useState(prepareDays(31));
  const months = useMemo(() => dayjs.months().map((m, i) => ({ label: m, value: i })), []);

  useEffect(() => {
    if (value) {
      const date = dayjs(value);
      setInnerDate({ ...innerDate, year: date.get('year'), day: date.get('date'), month: date.get('month') });
    }
  }, [value]);

  useEffect(() => {
    if (only && innerDate[only]) {
      onChange(innerDate[only]);
    }
    if (Object.values(innerDate).filter(v => v !== null).length === 3) {
      onChange(
        dayjs().set('year', innerDate.year).set('month', innerDate.month).set('date', innerDate.day).toISOString()
      );
    }
  }, [innerDate.year, innerDate.month, innerDate.day]);

  useEffect(() => {
    const date = innerDate.year
      ? dayjs().set('year', innerDate.year).set('month', innerDate.month)
      : dayjs().set('month', innerDate.month);
    setDaysInMonth(oldValue => (date.daysInMonth() ? prepareDays(date.daysInMonth()) : oldValue));
  }, [innerDate.month, innerDate.year]);

  useEffect(() => {
    const y = [];
    // eslint-disable-next-line no-plusplus
    for (let i = dayjs().year() - limit; i > 1900; i--) {
      y.push({ label: i, value: i });
    }

    setYears(y);
  }, []);

  return (
    <div className="flex flex-wrap items-start justify-end">
      <div className="grid w-full grid-cols-3 gap-4">
        {(!only || only === 'year') && (
          <div className={classNames(inverted && 'order-3')}>
            <Select
              options={years}
              type="text"
              value={innerDate.year}
              onChange={e => setInnerDate({ ...innerDate, year: e })}
              placeholder={t('register.fields.birthdate.placeholderYear')}
            />
          </div>
        )}
        {(!only || only === 'month') && (
          <div className="order-2">
            <Select
              options={months}
              type="text"
              value={innerDate.month}
              onChange={e => setInnerDate({ ...innerDate, month: e })}
              placeholder={t('register.fields.birthdate.placeholderMonth')}
            />
          </div>
        )}
        {(!only || only === 'day') && (
          <div className={classNames(inverted && 'order-1')}>
            <Select
              options={daysInMonth}
              type="text"
              value={innerDate.day}
              onChange={e => setInnerDate({ ...innerDate, day: e })}
              placeholder={t('register.fields.birthdate.placeholderDay')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HorizontalDatePicker;
