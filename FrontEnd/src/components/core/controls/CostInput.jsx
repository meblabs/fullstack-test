/* eslint-disable no-param-reassign */
/* eslint-disable react/jsx-props-no-spreading */
import { useCallback, useEffect, useState } from 'react';
import { InputNumber } from 'antd';
import config from '../../../config';

const { defaultCurrency, defaultCostFormat, centsBasedCosts } = config;

export const CostInputFormats = {
  DOT_DECIMALS: 'en-US',
  COMMA_DECIMALS: 'it-IT'
};

const CostInput = ({
  currency,
  value = '0.00',
  onChange = () => {},
  format = defaultCostFormat || CostInputFormats.COMMA_DECIMALS,
  unitOfMeasurement = {},
  centsBased = centsBasedCosts ?? false,
  ...props
}) => {
  const [internvalValue, setInternalValue] = useState(value);
  const [displayedCurrency, setDisplayedCurrency] = useState('');

  const parser = useCallback(
    input => {
      if (input.includes(',') && input.includes('.')) {
        const lastCommaIndex = input.lastIndexOf(',');
        const lastDotIndex = input.lastIndexOf('.');
        if (lastCommaIndex > lastDotIndex) {
          input = input.replace(/\./g, '');
        } else {
          input = input.replace(/,/g, '');
        }
      }
      const sanitizedValue = input.toString().replace(',', '.');
      const numericalValue = parseFloat(sanitizedValue);
      return centsBased ? Math.round(numericalValue * 100) : numericalValue;
    },
    [centsBased]
  );

  const formatter = useCallback(
    (val, { userTyping }) => {
      const centsAdjusted = centsBased ? val / 100 : val;
      if (!userTyping) return Intl.NumberFormat(format).format(centsAdjusted);
      return centsAdjusted;
    },
    [format, centsBased]
  );

  useEffect(() => {
    if (currency) return setDisplayedCurrency(currency.toUpperCase());
    return setDisplayedCurrency(defaultCurrency);
  }, [currency]);

  return (
    <InputNumber
      min={0}
      {...props}
      value={internvalValue}
      onChange={_v => {
        setInternalValue(_v);
        onChange(_v);
      }}
      addonAfter={unitOfMeasurement.symbol ? `${displayedCurrency}/${unitOfMeasurement.symbol}` : displayedCurrency}
      parser={parser}
      formatter={formatter}
    />
  );
};

export default CostInput;
