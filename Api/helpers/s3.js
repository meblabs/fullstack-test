const { S3, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v1: uuidv1 } = require('uuid');

const { AWS_DEFAULT_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_DATA, AWS_S3_BUCKET_TMP, ENV } =
  process.env;

const params = {
  region: AWS_DEFAULT_REGION,
  s3ForcePathStyle: true
};
if (ENV === 'dev') {
  params.credentials = {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  };
}

const s3 = new S3(params);
const copyFile = (sourcePath, fileName) =>
  s3.copyObject({
    ACL: 'public-read',
    CopySource: sourcePath,
    Bucket: AWS_S3_BUCKET_DATA,
    Key: fileName
  });

const deleteFile = (fileName, bucket = AWS_S3_BUCKET_DATA) =>
  s3.deleteObject({
    Bucket: bucket,
    Key: fileName
  });

const moveTmpFile = async (tmpName, fileName) => {
  if (process.env.ENV !== 'test') {
    try {
      await copyFile(AWS_S3_BUCKET_TMP + '/' + tmpName, fileName);
      return deleteFile(tmpName, AWS_S3_BUCKET_TMP);
    } catch (err) {
      return null;
    }
  }
  return null;
};

const getFile = fileName =>
  new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: AWS_S3_BUCKET_DATA,
        Key: fileName
      },
      (err, res) => (err ? reject(err) : resolve(res))
    );
  });

const generateName = ext => uuidv1({ msecs: new Date().getTime(), nsecs: 5678 }) + '.' + ext;

const getType = ext => {
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'png':
      return 'image/png';
    case 'pdf':
      return 'application/pdf';
    default:
      return false;
  }
};

const getSign = async ext => {
  const fileName = generateName(ext);
  const fileType = getType(ext);

  const s3Params = {
    Bucket: AWS_S3_BUCKET_TMP,
    Key: fileName,
    ContentType: fileType,
    ACL: 'public-read'
  };

  const command = new PutObjectCommand(s3Params);

  try {
    const signedRequest = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return Promise.resolve({
      signedRequest,
      url: 'http://' + AWS_S3_BUCKET_TMP + '/' + fileName,
      fileType,
      fileName
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

module.exports = {
  generateName,
  moveTmpFile,
  getFile,
  deleteFile,
  getSign
};
