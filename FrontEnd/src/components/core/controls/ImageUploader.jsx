/* eslint-disable react/jsx-props-no-spreading */
import { memo, useState, useEffect, useRef } from 'react';
import { Modal, Progress, Upload } from 'antd';
import axios from 'axios';
import ImgCrop from 'antd-img-crop';
import { useTranslation } from 'react-i18next';
import { sprintf } from 'sprintf-js';

import Api from '../../../helpers/core/Api';

import '../../../styles/core/components/ImageUploader.css';

const { Dragger } = Upload;

const getBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

let cancelTokenSource;

const ImageUploader = props => {
  const {
    className,
    onChange,
    initImage,
    initUploadImage,
    skipSetUploaded,
    overlay,
    withCrop,
    cover,
    sizeLimit,
    progressSize,
    disabled,
    fill
  } = props;

  const { t } = useTranslation();

  const parentRef = useRef(null);
  const [uploaded, setUploaded] = useState(initUploadImage || null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [previewHeight, setPreviewHeight] = useState(0);

  useEffect(() => {
    setUploaded(initUploadImage);
  }, [initUploadImage]);

  useEffect(() => {
    const updateSize = () => {
      setPreviewHeight(parentRef.current?.clientHeight);
    };

    window.addEventListener('resize', updateSize);

    setTimeout(() => {
      updateSize();
    }, 100);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const req = async ({ file, onError, onSuccess }) => {
    if (cancelTokenSource) cancelTokenSource.cancel();

    setUploaded(null);
    setProgress(0);
    if (onChange) onChange(null);
    setPreview(await getBase64(file));

    return Api.get(`/s3/sign/${file.name.split('.').pop()}`)
      .then(({ data }) => {
        cancelTokenSource = axios.CancelToken.source();

        const { url, fileType, fileName, signedRequest } = data;
        const options = {
          cancelToken: cancelTokenSource.token,
          withCredentials: false,
          headers: {
            'Content-Type': fileType
          },
          onUploadProgress: event => {
            const percent = Math.floor((event.loaded / event.total) * 100);
            setProgress(percent);
          }
        };

        return Api.put(signedRequest, file, options)
          .then(async res => {
            cancelTokenSource = null;

            if (!skipSetUploaded) setUploaded(url);
            setPreview(null);
            onSuccess(url);
            if (onChange) onChange({ url, fileName, fileType });
          })
          .catch(es3 => {
            setUploaded(null);
            setPreview(null);
            setProgress(0);
            if (onChange) onChange(null);

            if (axios.isCancel(es3)) return;
            onError();

            if (es3.globalHandler) es3.globalHandler();
          });
      })
      .catch(e => {
        setUploaded(null);
        setPreview(null);
        setProgress(0);
        onError();
        if (onChange) onChange(null);
        return e.globalHandler && e.globalHandler();
      });
  };

  const beforeHandler = file => {
    if (sizeLimit) {
      const isLt2M = file.size / 1024 / 1024 < sizeLimit;
      if (!isLt2M) {
        Modal.error({
          title: t('common.error'),
          content: sprintf(t('core:errors.213'), sizeLimit)
        });
      }
      return isLt2M;
    }
    return true;
  };

  const progSize = progressSize || { uploaded: 40, default: 100 };

  const classBgCover = 'absolute h-full w-full bg-cover bg-center bg-no-repeat';

  const previewCovers = [];
  if (cover) {
    if (!uploaded && initImage)
      previewCovers.push(
        <div key="cover3" className={classBgCover} style={{ backgroundImage: "url('" + initImage + "')" }} />
      );
    if (preview)
      previewCovers.push(
        <div key="cover2" className={classBgCover} style={{ backgroundImage: "url('" + preview + "')" }} />
      );
    if (uploaded)
      previewCovers.push(
        <div key="cover1" className={classBgCover} style={{ backgroundImage: "url('" + uploaded + "')" }} />
      );
  }

  const uploader = (
    <Dragger
      name="file"
      multiple={false}
      maxCount="1"
      accept="image/png, image/jpeg"
      itemRender={() => null}
      customRequest={req}
      beforeUpload={beforeHandler}
      disabled={disabled}
      className={'image-uploader ' + (className && className) + (fill && ' fill')}
    >
      <div ref={parentRef} className="absolute left-0 top-0 h-full w-full">
        {overlay && <div className="absolute bottom-4 right-4 z-10">{overlay}</div>}
        <div
          className="flex h-full flex-col justify-center overflow-hidden"
          style={{
            height: previewHeight
          }}
        >
          {uploaded || preview || initImage ? (
            <div className="flex h-full flex-col justify-center">
              {cover && previewCovers}
              {!cover && (uploaded || preview || initImage) && (
                <img
                  onDragStart={e => e.preventDefault()}
                  src={uploaded || preview || initImage}
                  alt="Dragger Preview"
                  className={'relative z-0 max-h-full max-w-full object-contain ' + (preview && 'opacity-60')}
                />
              )}
              {(uploaded || preview) && (
                <Progress
                  type="circle"
                  percent={progress}
                  style={{ transform: uploaded ? 'translate3d(0, 0, 0)' : 'translate3d(-50%, -50%, 0)' }}
                  className={
                    'absolute z-10 transition-all duration-300 ' +
                    (uploaded ? 'right-4 top-4' : 'absolute left-1/2 top-1/2')
                  }
                  size={uploaded ? progSize.uploaded : progSize.default}
                />
              )}
            </div>
          ) : (
            <div className="image-uploader-info">{props.children}</div>
          )}
        </div>
      </div>
    </Dragger>
  );

  return withCrop ? <ImgCrop {...withCrop}>{uploader}</ImgCrop> : uploader;
};

export default memo(ImageUploader);
