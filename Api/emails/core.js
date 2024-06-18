/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-undef */
const { SESClient, SendTemplatedEmailCommand } = require('@aws-sdk/client-ses');
const fs = require('fs');
const path = require('path');

const { COMMON_EMAIL, COMMON_EMAIL_NAME } = require('../config');

const { AWS_DEFAULT_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, ENV, SEND_EMAIL, TEST_EMAIL, Project } =
  process.env;

const params = { region: AWS_DEFAULT_REGION };
if (ENV === 'dev') {
  params.credentials = {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  };
}
const SES = new SESClient(params);

const localesPath = `${__dirname}/locales/`;
const emailLangs = fs
  .readdirSync(localesPath, { withFileTypes: true })
  .filter(dir => dir.isDirectory())
  .reduce((langs, dir) => {
    const lang = dir.name;
    langs[lang] = fs
      .readdirSync(localesPath + lang + '/')
      .filter(file => file.split('.')[1] === 'json')
      .reduce((acc, file) => {
        const f = path.parse(file).name;
        acc[f] = require(`${localesPath}${lang}/${f}.json`);
        return acc;
      }, {});
    return langs;
  }, {});

module.exports.getEmailText = (lang, email) => emailLangs[lang.toLowerCase()][email];

module.exports.send = async ({ template = 'common', to = ['design@meblabs.com'], subject, body }) => {
  const appendTemplate = ENV !== 'production' ? '-' + ENV : '';

  if (SEND_EMAIL !== '1') {
    if (ENV !== 'test') {
      console.log('[SEND EMAIL]');
      console.log('- template:', template);
      console.log('- to:', to);
      console.log('- subject:', subject);
      console.log('- body:', body);
    }
    return Promise.resolve();
  }

  if (TEST_EMAIL) {
    subject += ` - to: ${to.toString()}`;
    to = [TEST_EMAIL];
  }

  const command = new SendTemplatedEmailCommand({
    Template: Project + '-' + template + appendTemplate,
    TemplateData: JSON.stringify({
      subject,
      body
    }),
    Source: `"${COMMON_EMAIL_NAME}" <${COMMON_EMAIL}>`,
    Destination: {
      ToAddresses: to
    }
  });

  try {
    return await SES.send(command);
  } catch (err) {
    console.error('[SES] Failed to send email.', err);
    return err;
  }
};
