/* eslint-disable no-param-reassign */
/* eslint-disable react/jsx-props-no-spreading */
import { useContext, useEffect, useState } from 'react';
import { Table as AntTable, Popconfirm, Button, Input, Form, theme, Tooltip, Modal, Spin, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faSearch, faAdd, faFilter } from '@fortawesome/free-solid-svg-icons';
import InfiniteScroll from 'react-infinite-scroll-component';

import { classNames } from '../../../helpers/core/utils';
import useOnResize from '../../../hooks/core/useOnResize';
import Filters from './Filters';
import MessageContext from '../../../helpers/core/MessageContext';

import '../../../styles/core/components/Table.css';

const { useToken } = theme;
const { Text } = Typography;

const Table = ({
  form = false,
  dataSource = [],
  infinite = false,
  leftActions,
  rightActions,
  className,
  tableClassName,
  addForm,
  setupAddForm,
  onEscape = () => {},
  onEnter = () => {},
  deleteSaveButtonOnRow = false,
  editCancelButtonOnRow = false,
  onDelete = () => {},
  onEdit = () => {},
  columns: initColumns,
  searchBar = false,
  onChangeSearchBar = () => {},
  sortableKeys = [],
  pagination = false,
  compact = false,
  totalCount,
  countLabel = null,
  handleSaveMessage = true,
  stickyHeader = false,
  filters,
  searchDelay = 300,
  loading,
  ...props
}) => {
  const { t } = useTranslation();
  const { loadingMsg, savedMsg, errorMsg, destroyMsg } = useContext(MessageContext);
  const [columns, setColumns] = useState(initColumns);
  const [formDisabled, setFormDisabled] = useState(false);
  const { token } = useToken();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [searchTimer, setSearchTimer] = useState(null);
  const [topGap, setTopGap] = useState(0);

  const handleResize = () => {
    const topBar = document.getElementById('topbar');
    const titleBox = document.querySelector('.content-panel #title-box');
    const tabNav = document.querySelector('.content-panel .ant-tabs > .sticky > .ant-tabs-nav');
    setTopGap((topBar?.offsetHeight || 0) + (titleBox?.offsetHeight || 0) + (tabNav?.offsetHeight || 0));
  };

  useOnResize(handleResize);

  const recordSaving = handleSaveMessage
    ? (fun, record) => {
        const msg = loadingMsg();
        setFormDisabled(true);

        return fun(record)
          .then(() => {
            setFormDisabled(false);
            savedMsg(msg);
          })
          .catch(err => {
            setFormDisabled(false);
            errorMsg(msg, Array.isArray(err?.errorFields) ? t('common.validationFail') : err);
          });
      }
    : (fun, record) => fun(record);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    if (addForm.onCancel) addForm.onCancel();
  };

  const keyListener = event => {
    switch (event.code) {
      case 'Escape':
        return onEscape();
      case 'Enter':
        return recordSaving(onEnter);
      default:
        return false;
    }
  };

  const handleAddModalSave = () => {
    if (!addForm?.onSave) return handleCancel();

    setIsModalLoading(true);
    const msg = loadingMsg();
    return addForm
      .onSave()
      .then(() => {
        savedMsg(msg);
        if (addForm.closeAfterSave) handleCancel();
      })
      .catch(err => (err.errorFields ? destroyMsg(msg) : errorMsg(msg, err)))
      .finally(() => setIsModalLoading(false));
  };

  const searchBarChange = data => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    const newTimer = setTimeout(() => {
      data.target.value = encodeURIComponent(data.target.value);
      onChangeSearchBar(data);
    }, searchDelay);

    setSearchTimer(newTimer);
  };

  useEffect(() => {
    const handleKeyPress = event => {
      if (
        event.key === 'Enter' &&
        isModalOpen &&
        event.target?.tagName?.toLowerCase() !== 'textarea' &&
        event.target?.type !== 'search'
      ) {
        handleAddModalSave();
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isModalOpen, handleAddModalSave]);

  const renderAddModal = () =>
    addForm ? (
      <Modal
        title={addForm.title ?? t('common.new')}
        width={addForm.width}
        open={isModalOpen}
        onOk={handleAddModalSave}
        onCancel={() => {
          addForm.onCancel?.();
          handleCancel();
        }}
        footer={[
          <Button key="submit" type="primary" loading={isModalLoading} onClick={handleAddModalSave}>
            {t('common.save')}
          </Button>
        ]}
        destroyOnClose={addForm.destroyOnClose || false}
      >
        {addForm.template}
      </Modal>
    ) : (
      ''
    );

  useEffect(() => {
    let newColumns = initColumns;

    if (deleteSaveButtonOnRow) {
      newColumns = newColumns.concat([
        {
          dataIndex: 'deleteSave',
          width: 46,
          className: 'button-cell ',
          render: (_, record) => (
            <Form.Item>
              <Popconfirm
                placement="left"
                title={t('common.sureToDelete')}
                onConfirm={() => recordSaving(onDelete, record)}
                okText={t('common.yes')}
                cancelText={t('common.no')}
              >
                <Button type="text" size="small">
                  <FontAwesomeIcon icon={faTrashAlt} />
                </Button>
              </Popconfirm>
            </Form.Item>
          )
        }
      ]);
    }

    if (editCancelButtonOnRow) {
      newColumns = [
        {
          dataIndex: 'edit',
          width: 46,
          className: 'button-cell',
          editable: false,
          fixed: 'left',
          render: (_, record) => (
            <Form.Item>
              <Button type="text" size="small" className="btn-edit" onClick={event => onEdit(record, event)}>
                <FontAwesomeIcon icon={faEdit} />
              </Button>
            </Form.Item>
          )
        }
      ].concat(newColumns);
    }

    newColumns.forEach(col => {
      if (sortableKeys.includes(col.key)) {
        col.sorter = col.sorter || true;
        col.sortDirections = col.sortDirections || ['ascend', 'descend', 'ascend'];
      }

      const tmpRender = col.render || null;
      col.render = (value, record, idx) => (
        <div className="responsive-table-cell" data-title={col.title}>
          <Tooltip {...col?.tooltip}>{(tmpRender && tmpRender(value, record, idx)) || value || ''}</Tooltip>
        </div>
      );
    });

    return setColumns([...newColumns]);
  }, [initColumns]);

  useEffect(() => {
    window.removeEventListener('keydown', keyListener);

    return () => {
      window.removeEventListener('keydown', keyListener);
    };
  });

  const headerMargin = searchBar || rightActions || addForm || filters ? 'mb-2' : 'mb-0';

  const header = (
    <div
      className={stickyHeader ? 'sticky z-[1000] -mt-5 w-full py-5' : ''}
      style={{ top: `${topGap}px`, backgroundColor: token.colorBgLayout }}
    >
      <div className="-mx-2">
        <div className={`${headerMargin} flex w-full flex-wrap`}>
          <div className="order-1 flex flex-1 flex-wrap items-center px-2 md:w-auto md:flex-none md:flex-nowrap md:space-x-2">
            {searchBar ? (
              <Input
                onChange={searchBarChange}
                disabled={loading}
                className="table-search-bar w-full md:w-auto"
                addonAfter={<FontAwesomeIcon icon={faSearch} />}
              />
            ) : (
              <div />
            )}
          </div>
          <div className="order-2 flex flex-shrink items-center justify-end space-x-2 px-2 md:order-3 md:ml-auto md:w-auto">
            {rightActions || ''}
            {addForm && (
              <Tooltip title={t('common.add')} mouseEnterDelay="0.5">
                <Button
                  type="primary"
                  onClick={addForm?.onClick || showModal}
                  icon={<FontAwesomeIcon icon={faAdd} />}
                />
              </Tooltip>
            )}
            {filters?.layout && (
              <Tooltip title={t('common.filter')} mouseEnterDelay="0.5">
                <Button
                  className={classNames(filters.filterIconClass, filters.showFilter && 'filter-btn-open')}
                  danger={false}
                  type="primary"
                  icon={<FontAwesomeIcon icon={faFilter} />}
                  onClick={() => filters.toggleFilter()}
                />
              </Tooltip>
            )}
          </div>
          <div className="table-left-actions order-3 mt-2 flex w-full space-x-2 px-2 md:order-2 md:mt-0 md:w-auto">
            {leftActions || ''}
          </div>
        </div>
        {totalCount !== undefined ? (
          <div className="mb-2 px-2">
            <Text type="secondary" className="text-xs">
              {loading ? `${t('common.loading')}...` : t(countLabel || 'common.count', { count: totalCount })}
            </Text>
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  );

  const table = infinite ? (
    <InfiniteScroll
      dataLength={dataSource.length}
      {...infinite}
      style={{ backgroundColor: token.colorBgContainer }}
      loader={
        <div className="m-10 flex justify-center">
          <Spin />
        </div>
      }
    >
      <AntTable
        {...props}
        loading={loading}
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        showSorterTooltip={false}
        className={tableClassName}
      />
    </InfiniteScroll>
  ) : (
    <AntTable
      {...props}
      loading={loading}
      dataSource={dataSource}
      columns={columns}
      pagination={pagination}
      showSorterTooltip={false}
      className={tableClassName}
    />
  );

  const container = (
    <div className={classNames(filters?.filterContainerClasses, className)}>
      {filters?.layout && (
        <Filters
          onClose={filters.onCloseDrawer}
          onClear={() => filters.onClearFilters(filters.form)}
          showFilter={filters.showFilter}
          showReset={filters.hasFilters}
          filters={filters.layout}
          topGap={filters.topGap}
        />
      )}
      {!compact && header}
      {table}
      {setupAddForm ? setupAddForm() : renderAddModal()}
    </div>
  );

  return form ? (
    <Form form={form} component={false} disabled={formDisabled}>
      {container}
    </Form>
  ) : (
    container
  );
};

export default Table;
