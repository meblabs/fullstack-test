/* eslint-disable react/jsx-props-no-spreading */
import { Button, Drawer, Tooltip, theme } from 'antd';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { classNames } from '../../../helpers/core/utils';
import useLocalStorage from '../../../hooks/core/useLocalStorage';
import useOnResize from '../../../hooks/core/useOnResize';

import '../../../styles/core/components/Filters.css';

const Filters = ({ filters, title, onClose, onClear, showFilter, showReset = false, ...props }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [topGap, setTopGap] = useState(0);

  const handleResize = () => {
    const topBar = document.getElementById('topbar');
    const titleBox = document.querySelector('.content-panel #title-box');
    const tabNav = document.querySelector('.content-panel .with-tabs > .ant-tabs > .sticky > .ant-tabs-nav');
    setTopGap((topBar?.offsetHeight || 0) + (titleBox?.offsetHeight || 0) + (tabNav?.offsetHeight || 0));
  };

  useOnResize(handleResize);

  return (
    <Drawer
      {...props}
      title={title || t('common.filter')}
      placement="right"
      mask={false}
      onClose={onClose}
      open={showFilter}
      // getContainer={document.getElementById('title-box')}
      contentWrapperStyle={{
        boxShadow: 'none',
        borderLeft: `1px solid ${token.colorBorder}`,
        top: topGap || token.drawerTop
      }}
      extra={
        showReset && (
          <Button danger onClick={onClear}>
            {t('common.clearFilters')}
          </Button>
        )
      }
    >
      {filters}
    </Drawer>
  );
};

export default Filters;

export function useFilters(filterName = 'default') {
  const [savedFilters, setSavedFilters] = useLocalStorage(`filters-${filterName}`);
  const [showFilter, setShowFilter] = useState(savedFilters?.__open ?? false);
  const [filterIconClass, setFilterIconClass] = useState('default');
  const filterContainerClasses = classNames(
    'ease filters-wrapper transition-all duration-300',
    showFilter && 'filter-open 2xl:pr-[378px]'
  );
  const { t } = useTranslation();

  const saveFilters = (key, val) => {
    const oldVal = savedFilters ?? {};
    const newVal = {};
    if (val?.length || val === true) {
      newVal[key] = val;
    } else {
      delete oldVal[key];
    }

    setSavedFilters({
      ...oldVal,
      ...newVal
    });
  };

  const toggleFilter = () => {
    setShowFilter(!showFilter);
    saveFilters('__open', !showFilter);
  };

  const onCloseDrawer = () => {
    setShowFilter(false);
    saveFilters('__open', false);
  };

  const onClearFilters = form => {
    form.resetFields();
    setSavedFilters({});
  };

  const hasFilters = savedFilters && Object.keys(savedFilters).filter(k => k !== '__open').length > 0;

  const toggleFilterButton = (
    <Tooltip title={t('common.filter')}>
      <Button
        type="primary"
        className={filterIconClass}
        shape="circle"
        icon={<FontAwesomeIcon icon={faFilter} />}
        onClick={() => toggleFilter()}
      />
    </Tooltip>
  );

  useEffect(() => {
    if (hasFilters) {
      setFilterIconClass('filter-btn-full');
    } else {
      setFilterIconClass('filter-btn-empty');
    }
  }, [hasFilters]);

  return {
    showFilter,
    onCloseDrawer,
    toggleFilter,
    filterContainerClasses,
    saveFilters,
    onClearFilters,
    hasFilters,
    savedFilters,
    setSavedFilters,
    toggleFilterButton,
    filterIconClass
  };
}
