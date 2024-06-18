/* eslint-disable no-await-in-loop */
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION, ENV } = process.env;

const AwsParams = { region: AWS_DEFAULT_REGION };
if (ENV === 'dev') {
  AwsParams.credentials = {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  };
}

const lambda = new LambdaClient(AwsParams);

const sendCommand = params => {
  const command = new InvokeCommand(params);
  return lambda.send(command);
};

module.exports.invoke = async ({ maxRetries = 5, initRetryDelay = 1000, retryCount = 0, ...params }) => {
  let result;

  try {
    result = await sendCommand(params);
  } catch (err) {
    retryCount += 1;
    if (err?.name !== 'CodeArtifactUserPendingException' || retryCount >= maxRetries) throw err;
    const delay = Math.min(initRetryDelay * 2 ** retryCount, 10000);
    // eslint-disable-next-line no-promise-executor-return
    await new Promise(resolve => setTimeout(resolve, delay));
    result = await module.exports.invoke({ maxRetries, initRetryDelay, retryCount, ...params });
  }
  return result;
};
