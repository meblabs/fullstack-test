import { useEffect, useState } from 'react';
import { Button, Space, Upload } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowDown, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import Api from '../../../helpers/core/Api';

const MultipleFileUploader = ({ initFileList = [], onChange, parentId, parentType = 'Attachment' }) => {
  const { t } = useTranslation();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (initFileList.length)
      setFileList(
        initFileList.map(e => ({
          url: e.url,
          uid: e.uri,
          status: 'done',
          name: e.name || e.url,
          type: e.fileType,
          response: e.uri,
          id: e._id,
          disabled: e.disabled
        }))
      );
  }, [initFileList]);

  const handleChange = ({ fileList: _fileList, file }) => {
    if (onChange) onChange(_fileList);
    setFileList(_fileList);
  };

  const handleRemove = file => {
    if (file.disabled) return false;

    return Api.delete(`/files/${file.id}`);
  };

  const customRequest = ({ file, onError, onSuccess }) =>
    Api.get(`/s3/sign/${file.name.split('.').pop()}`)
      .then(({ data }) => {
        const { fileType, fileName, signedRequest } = data;

        const options = {
          withCredentials: false,
          headers: {
            'Content-Type': fileType
          }
        };

        return Api.put(signedRequest, file, options)
          .then(() => onSuccess(fileName))
          .then(() =>
            Api.post('/files', {
              fileType,
              uri: fileName,
              name: file.name,
              parent: parentId,
              parentModel: parentType
            })
          );
      })
      .catch(e => {
        onError();
        return e.globalHandler && e.globalHandler();
      });

  const itemRender = (originNode, file, list, actions) => {
    if (file.disabled) {
      return <div style={{ opacity: '0.5', cursor: 'not-allowed' }}>{originNode}</div>;
    }
    return <div>{originNode}</div>;
  };

  return (
    <Upload
      multiple
      fileList={fileList}
      itemRender={itemRender}
      response={false}
      customRequest={e => customRequest(e)}
      onChange={e => handleChange(e)}
      onPreview={e => e.url && window.open(e.url)}
      onDownload={e => {
        if (!e.url) return;
        fetch(e.url)
          .then(response => response.blob())
          .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = e.name;
            link.click();
          });
      }}
      onRemove={handleRemove}
      showUploadList={{
        showDownloadIcon: true,
        downloadIcon: <FontAwesomeIcon icon={faCloudArrowDown} />,
        showRemoveIcon: true,
        removeIcon: <FontAwesomeIcon icon={faTrashAlt} />
      }}
    >
      <Button>
        <Space direction="horizzontal">
          <div>{t('common.upload')}</div>
          <FontAwesomeIcon icon={faPlus} />
        </Space>
      </Button>
    </Upload>
  );
};

export default MultipleFileUploader;
