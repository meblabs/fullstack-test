import { useEffect, useState } from 'react';
import { Upload, Image } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import Api from '../../../helpers/core/Api';

const MultipleImagesUploader = ({ initFileList = [], onChange }) => {
  const { t } = useTranslation();
  const [fileList, setFileList] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (initFileList.length)
      setFileList(
        initFileList.map(e => ({
          url: e,
          uid: e,
          status: 'done',
          name: e,
          response: e.split('/').pop(),
          load: !newFiles.includes(e.split('/').pop())
        }))
      );
  }, [initFileList]);

  const handleChange = ({ fileList: _fileList, file }) => {
    if (_fileList.length >= fileList.length && file.response) {
      setNewFiles(newFiles.concat([file.response]));
    }

    if (onChange) onChange(_fileList);
    setFileList(_fileList);
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
          .catch(es3 => {
            onError();

            if (es3.globalHandler) es3.globalHandler();
          });
      })
      .catch(e => {
        onError();
        return e.globalHandler && e.globalHandler();
      });

  const handlePreview = data => {
    setCurrent(fileList.indexOf(data));
    setVisible(true);
  };

  return (
    <>
      <Upload
        listType="picture-card"
        multiple
        fileList={fileList}
        isImageUrl={file => (file.load !== undefined ? file.load : true)}
        onPreview={e => handlePreview(e)}
        onChange={e => handleChange(e)}
        accept="image/png, image/jpeg"
        response={false}
        customRequest={e => customRequest(e)}
      >
        <div>
          <FontAwesomeIcon icon={faPlus} />
          <div>{t('common.upload')}</div>
        </div>
      </Upload>
      <div style={{ display: 'none' }}>
        <Image.PreviewGroup
          preview={{
            visible,
            onVisibleChange: vis => setVisible(vis),
            current
          }}
        >
          {fileList.map(e => (
            <Image src={e.url || e.thumbUrl} key={e.uid} />
          ))}
        </Image.PreviewGroup>
      </div>
    </>
  );
};

export default MultipleImagesUploader;
