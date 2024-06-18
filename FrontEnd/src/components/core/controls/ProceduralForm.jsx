import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import ProceduralFormItem from './ProceduralFormItem';
import WrapperForm from './WrapperForm';
import SubmitButton from './SubmitButton';

const ProceduralForm = ({ json, fetchData, onFinish, disabled, form, layout = 'vertical', compact }) => {
  const { i18n, t } = useTranslation();
  const [data, setData] = useState();
  const submitButtonRef = useRef(null);

  useEffect(() => {
    setData(json());

    fetchData().then(res => {
      form.setFieldsValue(res.data);
    });
  }, []);

  i18n.on('languageChanged', () => {
    setData(json());
  });

  const items = data?.pages[0].elements;

  return (
    <WrapperForm form={form} onSubmit={onFinish} disabled={disabled} layout={layout} submitBtn={submitButtonRef}>
      <div className="-mx-4 flex flex-wrap">
        {items &&
          items
            .filter(i => i.type !== 'checkbox')
            .map(i => <ProceduralFormItem form={form} key={i.name} item={i} disabled={disabled} />)}
      </div>
      <SubmitButton ref={submitButtonRef} type="primary">
        {t('common.save')}
      </SubmitButton>
    </WrapperForm>
  );
};

export default ProceduralForm;
