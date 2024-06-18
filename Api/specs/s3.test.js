const supertest = require('supertest');

const app = require('../app');
const db = require('../db/connect-test');
const User = require('../models/user');
const { genereteAuthToken } = require('../helpers/auth');
const { getSign } = require('../helpers/s3');

const agent = supertest.agent(app);

// mock s3
jest.mock('../helpers/s3');
const signRes = {
  signedRequest:
    // eslint-disable-next-line max-len
    'http://localhost:4566/tmp/99f94a2e-eeb1-11eb-a505-c59533920857.png?AWSAccessKeyId=awstest&Content-Type=image%2Fpng&Expires=1627374112&Signature=kqWp8KdeSGYprckAmsBlNxx5ouQ%3D&x-amz-acl=public-read',
  url: 'http://localhost:4566/tmp/99f94a2e-eeb1-11eb-a505-c59533920857.png',
  fileType: 'image/jpeg',
  fileName: '99f94a2e-eeb1-11eb-a505-c59533920857.png'
};
getSign.mockResolvedValue(signRes);

let user;
let userToken;

beforeAll(async () => await db.connect());
beforeEach(async () => {
  await db.clear();

  user = await new User({
    email: 'user@meblabs.com',
    password: 'testtest',
    name: 'John',
    lastname: 'Doe',
    pic: 'pic.jpg',
    role: 'user',
    active: true
  }).save();
  userToken = genereteAuthToken(user).token;
});
afterEach(() => jest.clearAllMocks());
afterAll(async () => await db.close());

describe('GET /sign', () => {
  test('Get sign without params ext should be should NotFound', async () =>
    agent
      .get('/s3/sign')
      .expect(404)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 404 }));
      }));

  test('Get sign with invalid ext should be should be ValidationError', async () =>
    agent
      .get('/s3/sign/test')
      .expect(400)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 200, data: '/ext' }));
      }));

  test('Get sign without auth should be should Unauthorized', async () =>
    agent
      .get('/s3/sign/jpg')
      .expect(401)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 401 }));
      }));

  test('Get sign with valid ext should be should be ok', async () =>
    agent
      .get('/s3/sign/jpg')
      .set('Cookie', `accessToken=${userToken}`)
      .expect(200)
      .then(res => {
        expect(res.body).toMatchObject(signRes);
      }));

  test('Get sign with valid uppercase ext should be should be ok', async () =>
    agent
      .get('/s3/sign/PNG')
      .set('Cookie', `accessToken=${userToken}`)
      .expect(200)
      .then(res => {
        expect(res.body).toMatchObject(signRes);
      }));
});
