import { DatePicker, Form, Input, Radio, Select } from 'antd';
import { t } from 'i18next';
import dayjs from 'dayjs';
import { useContext } from 'react';
import AppContext from '../../../helpers/AppContext';
import { classNames } from '../../../helpers/core/utils';

const ProceduralFormItem = ({ item, form, disabled, wrapperCol }) => {
  const { antLocale } = useContext(AppContext);
  let template;

  const renderVisibleIfWrapper = (fieldItem, formField) => {
    let name;
    let value;
    [name, value] = item.visibleIf.replace(/ /g, '').split('=');
    name = name.slice(1, -1); // remove first and last character
    if (value === 'true' || value === 'false') {
      value = value === 'true'; // safe boolean cast
    }
    return (
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, curValues) => prevValues[name] !== curValues[name]}
        rules={[
          {
            required: fieldItem.isRequired,
            message: t('validation.required')
          }
        ]}
      >
        {() => String(form.getFieldValue(name)) === String(value) && <div>{formField}</div>}
      </Form.Item>
    );
  };

  const renderFormItem = _item => {
    switch (_item.type) {
      case 'comment':
        template = (
          <Form.Item
            wrapperCol={wrapperCol}
            name={_item.name}
            label={_item.title}
            rules={[
              {
                required: _item.isRequired,
                message: t('validation.required')
              }
            ]}
          >
            <Input.TextArea autoSize={_item.autoSize} placeholder={_item.placeholder} />
          </Form.Item>
        );

        break;

      case 'boolean':
        template = (
          <Form.Item
            wrapperCol={wrapperCol}
            name={_item.name}
            label={_item.title}
            rules={[
              {
                required: _item.isRequired,
                message: t('validation.required')
              }
            ]}
          >
            {!disabled ? (
              <Radio.Group>
                <Radio value>Sì</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            ) : (
              <span>{form.getFieldValue(_item.name) ? t('common.yes') : t('common.no')}</span>
            )}
          </Form.Item>
        );

        break;

      case 'text':
        template = (
          <Form.Item
            wrapperCol={wrapperCol}
            name={_item.name}
            label={_item.title}
            rules={[
              {
                required: _item.isRequired,
                message: t('validation.required')
              }
            ]}
          >
            <Input />
          </Form.Item>
        );

        break;

      case 'date':
        template = (
          <Form.Item
            wrapperCol={wrapperCol}
            name={_item.name}
            label={_item.title}
            rules={[
              {
                required: _item.isRequired,
                message: t('validation.required')
              }
            ]}
          >
            <DatePicker locale={antLocale} format={data => dayjs(data).format('DD/MM/YYYY')} />
          </Form.Item>
        );

        break;

      default:
        template = (
          <Form.Item
            wrapperCol={wrapperCol}
            name={_item.name}
            label={_item.title}
            rules={[
              {
                required: _item.isRequired,
                message: t('validation.required')
              }
            ]}
          >
            <Select>
              {_item.choices
                ? _item.choices.map(c => (
                    <Select.Option key={c.value} value={c.value}>
                      {c.text}
                    </Select.Option>
                  ))
                : ''}
            </Select>
          </Form.Item>
        );

        break;
    }

    return _item.visibleIf ? renderVisibleIfWrapper(_item, template) : template;
  };

  return (
    <div
      className={classNames(
        'w-full px-4',
        item.size === 'half' && 'md:w-1/2',
        item.size === 'third' && 'md:w-1/2 lg:w-1/3'
      )}
    >
      {renderFormItem(item)}
    </div>
  );
};

export default ProceduralFormItem;
