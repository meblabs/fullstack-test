import { useState, useEffect, useCallback } from 'react';
import { Typography } from 'antd';
import config from '../../../config';

const { defaultCurrency, defaultCostFormat, centsBasedCosts } = config;

const { Text } = Typography;
const CostValue = ({
  currency,
  value = 0,
  format = defaultCostFormat || 'it-IT',
  maximumFractionDigits,
  minimumFractionDigits,
  unitOfMeasurement = {},
  text = false,
  className = '',
  alignStart = true,
  centsBased = centsBasedCosts ?? false
}) => {
  const [displayedCurrency, setDisplayedCurrency] = useState('');

  useEffect(() => {
    if (currency) return setDisplayedCurrency(currency.toUpperCase());
    return setDisplayedCurrency(defaultCurrency);
  }, [currency]);

  const rounder = useCallback(
    _value => {
      const centsAdjusted = centsBased ? _value / 100 : _value;
      const displayed = new Intl.NumberFormat(format, {
        maximumFractionDigits: maximumFractionDigits || 2,
        minimumFractionDigits: minimumFractionDigits || 2
      }).format(centsAdjusted);
      return text || Number.isNaN(displayed) ? _value : displayed;
    },
    [centsBased, format, maximumFractionDigits, minimumFractionDigits]
  );

  return (
    <p className={className + ` m-0 flex items-baseline gap-1 ${alignStart ? '' : ' justify-end'}`}>
      <Text type="secondary" className="text-xs">
        {unitOfMeasurement.symbol ? `${displayedCurrency}/${unitOfMeasurement.symbol}` : displayedCurrency}
      </Text>
      <span className="text-lg">{rounder(value)}</span>
    </p>
  );
};

export default CostValue;
