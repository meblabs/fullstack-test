import { useEffect, useState } from 'react';
import { Select } from 'antd';

import Api from '../../../helpers/core/Api';

let timeout;
const AsyncSelect = ({
  url,
  filterKey = 'filter',
  delay = 300,
  urlWithQuery = false,
  dataLabel = e => e.fullname,
  dataValue = e => e._id,
  dataKey = e => e._id,
  ...props
}) => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('');

  const getData = () =>
    Api.get(`${url}${urlWithQuery ? '' : '?'}&${filterKey}=${filter}`)
      .then(res => setData(res.data))
      .catch(err => err?.globalHandler());

  useEffect(() => {
    const onTextChange = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => (filter ? getData() : setData([])), delay);
    };

    onTextChange();
    return () => clearTimeout(timeout);
  }, [filter]);

  return (
    <Select
      {...props}
      allowClear
      showSearch
      onSearch={e => setFilter(e)}
      filterOption={false}
      options={data.map(e => ({
        label: dataLabel(e),
        value: dataValue(e),
        key: dataKey(e)
      }))}
    />
  );
};

export default AsyncSelect;
