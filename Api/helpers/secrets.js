const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const secretManager = new SecretsManagerClient({ region: process.env.AWS_DEFAULT_REGION });

module.exports.getSecret = async () => {
  const { SecretString: _secret } = await secretManager.send(
    new GetSecretValueCommand({ SecretId: process.env.AWS_SECRETS })
  );
  return JSON.parse(_secret);
};
