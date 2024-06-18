const supertest = require('supertest');

const app = require('../app');
const db = require('../db/connect-test');
const Company = require('../models/company');
const User = require('../models/user');
const { genereteAuthToken } = require('../helpers/auth');

const agent = supertest.agent(app);

jest.mock('../helpers/secrets.js');

let company1;
let company2;

beforeAll(async () => await db.connect());
beforeEach(async () => {
  await db.clear();
  const Company1Creation = async () => {
    company1 = await new Company({
      name: 'Company1',
      pic: 'companypic',
      lang: 'EN',
      zipcode: '12345',
      country: 'IT',
      address: 'Via XYZ 123',
      phone: { prefix: '+39', number: '1234567890', country: 'IT' },
      type: 'type1',
      vatNumber: 'IT1234567890'
    }).save();
  };
  const Company2Creation = async () => {
    company2 = await new Company({
      name: 'Company2',
      pic: 'companypic2',
      lang: 'EN',
      zipcode: '1231245',
      country: 'IT',
      address: 'Via XYZ 123',
      phone: { prefix: '+39', number: '1234567890', country: 'IT' },
      type: 'type2',
      vatNumber: 'IT1234567890'
    }).save();
  };
  const Company3Creation = async () => {
    await new Company({
      name: 'Company3',
      pic: 'companypic3',
      lang: 'IT',
      zipcode: '1234345',
      country: 'EN',
      address: 'Via XYZ 123',
      phone: { prefix: '+39', number: '1234567890', country: 'IT' },
      type: 'type1',
      vatNumber: 'IT1234567890'
    }).save();
  };

  return Promise.all([Company1Creation(), Company2Creation(), Company3Creation()]);
});
afterEach(async () => await jest.clearAllMocks());
afterAll(async () => await db.close());

describe('Role: superadmin', () => {
  let token;
  let superuser;
  beforeEach(() => {
    const SuperuserCreation = async () => {
      superuser = await new User({
        name: 'Super',
        lastname: 'Admin',
        email: 'superuser@meblabs.com',
        password: 'testtest',
        roles: ['superuser'],
        active: true
      }).save();

      token = genereteAuthToken(superuser).token;
    };

    return SuperuserCreation();
  });

  describe('GET /companies', () => {
    test('Get all companies', () =>
      agent
        .get('/companies?sorter=name')
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual([
            {
              _id: company1.id,
              name: 'Company1',
              pic: 'companypic',
              picUrl: 'https://data/images/companies/companypic',
              type: 'type1',
              createdAt: expect.any(String)
            },
            {
              _id: expect.any(String),
              name: 'Company2',
              pic: 'companypic2',
              picUrl: 'https://data/images/companies/companypic2',
              type: 'type2',
              createdAt: expect.any(String)
            },
            {
              _id: expect.any(String),
              name: 'Company3',
              pic: 'companypic3',
              picUrl: 'https://data/images/companies/companypic3',
              type: 'type1',
              createdAt: expect.any(String)
            }
          ])
        ));

    test('Get all companies paginated', () =>
      agent
        .get('/companies?sorter=name&count=true&limit=2&filter=c')
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res => {
          expect(res.body).toStrictEqual([
            {
              _id: company1.id,
              name: 'Company1',
              pic: 'companypic',
              type: 'type1',
              picUrl: 'https://data/images/companies/companypic',
              createdAt: expect.any(String)
            },
            {
              _id: expect.any(String),
              name: 'Company2',
              pic: 'companypic2',
              type: 'type2',
              picUrl: 'https://data/images/companies/companypic2',
              createdAt: expect.any(String)
            }
          ]);

          const nextKey = res.headers['x-next-key'];
          expect(JSON.parse(nextKey)).toStrictEqual({ _id: expect.any(String), name: 'Company2' });
          expect(res.headers['x-total-count']).toBe('3');

          return agent
            .get(`/companies?sorter=name&nextKey=${nextKey}&limit=2&filter=c`)
            .set('Cookie', `accessToken=${token}`)
            .expect(200);
        })
        .then(res =>
          expect(res.body).toStrictEqual([
            {
              _id: expect.any(String),
              name: 'Company3',
              pic: 'companypic3',
              picUrl: 'https://data/images/companies/companypic3',
              type: 'type1',
              createdAt: expect.any(String)
            }
          ])
        ));

    test('Get all companies filterd', () =>
      agent
        .get('/companies?sorter=name&filter=2')
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual([
            {
              _id: expect.any(String),
              name: 'Company2',
              pic: 'companypic2',
              picUrl: 'https://data/images/companies/companypic2',
              type: 'type2',
              createdAt: expect.any(String)
            }
          ])
        ));
  });

  describe('POST /companies', () => {
    test('Create a company with all fields', () =>
      agent
        .post('/companies')
        .set('Cookie', `accessToken=${token}`)
        .send({
          name: 'newCompany',
          lang: 'IT',
          pic: 'testPic',
          zipcode: '12345',
          country: 'EN',
          city: 'RE',
          address: 'Via XYZ 123',
          phone: { prefix: '+02', number: '1234567890', country: 'IT' },
          vatNumber: '1234567890IT00',
          type: 'type1'
        })
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: expect.any(String),
            name: 'newCompany',
            lang: 'IT',
            pic: 'testPic',
            picUrl: 'https://data/images/companies/testPic',
            zipcode: '12345',
            country: 'EN',
            city: 'RE',
            address: 'Via XYZ 123',
            phone: { prefix: '+02', number: '1234567890', country: 'IT', formatted: '+021234567890' },
            vatNumber: '1234567890IT00',
            type: 'type1',
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ));

    test('Create company with invalid lang', () =>
      agent
        .post('/companies')
        .set('Cookie', `accessToken=${token}`)
        .send({ name: 'newCompany', lang: 'test' })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/lang'
          })
        ));

    test('Default lang', () =>
      agent
        .post('/companies')
        .set('Cookie', `accessToken=${token}`)
        .send({
          name: 'newCompany',
          pic: 'testPic',
          zipcode: '12345',
          country: 'EN',
          city: 'RE',
          address: 'Via XYZ 123',
          phone: { prefix: '+02', number: '1234567890', country: 'IT' },
          vatNumber: '1234567890IT00'
        })
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: expect.any(String),
            name: 'newCompany',
            lang: 'EN',
            pic: 'testPic',
            picUrl: 'https://data/images/companies/testPic',
            zipcode: '12345',
            country: 'EN',
            city: 'RE',
            address: 'Via XYZ 123',
            phone: { prefix: '+02', number: '1234567890', country: 'IT', formatted: '+021234567890' },
            vatNumber: '1234567890IT00',
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ));

    test('Phone validation', () =>
      agent
        .post('/companies')
        .set('Cookie', `accessToken=${token}`)
        .send({ name: 'newCompany', phone: 'test' })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/phone'
          })
        ));

    test('Phone validation', () =>
      agent
        .post('/companies')
        .set('Cookie', `accessToken=${token}`)
        .send({
          name: 'newCompany',
          phone: { prefix: '+02', number: '1234567890', country: 'IT', formatted: '+021234567890' }
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 202,
            message: 'Additional parameters are not permitted',
            data: '/formatted'
          })
        ));

    test('Phone validation', () =>
      agent
        .post('/companies')
        .set('Cookie', `accessToken=${token}`)
        .send({
          name: 'newCompany',
          phone: { prefix: '+02', country: 'IT' }
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 201,
            message: 'Missing required parameters',
            data: '/number'
          })
        ));
  });

  describe('GET /companies/:id', () => {
    test('Get specific company', () =>
      agent
        .get(`/companies/${company1.id}`)
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: company1.id,
            name: 'Company1',
            type: 'type1',
            pic: 'companypic',
            picUrl: 'https://data/images/companies/companypic',
            lang: 'EN',
            zipcode: '12345',
            country: 'IT',
            address: 'Via XYZ 123',
            phone: { prefix: '+39', number: '1234567890', country: 'IT', formatted: '+391234567890' },
            vatNumber: 'IT1234567890',
            updatedAt: expect.any(String),
            createdAt: expect.any(String)
          })
        ));

    test('Get deleted company', async () => {
      await company1.softDelete();

      return agent.get(`/companies/${company1.id}`).set('Cookie', `accessToken=${token}`).expect(404);
    });
  });

  describe('PATCH /companies/:id', () => {
    test('Updating a company name updates the ref in each user without saving history', async () => {
      const tmpUser = await new User({
        name: 'Tmp',
        lastname: 'User',
        email: 'tmp@tmp.com',
        password: 'testtest',
        company: { id: company1.id, name: 'Company1', roles: ['user'], type: 'type1' }
      }).save();

      return agent
        .patch(`/companies/${company1.id}`)
        .send({ name: 'updated' })
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: company1.id,
            name: 'updated',
            pic: 'companypic',
            picUrl: 'https://data/images/companies/companypic',
            lang: 'EN',
            zipcode: '12345',
            country: 'IT',
            address: 'Via XYZ 123',
            phone: { prefix: '+39', number: '1234567890', country: 'IT', formatted: '+391234567890' },
            type: 'type1',
            vatNumber: 'IT1234567890',
            updatedAt: expect.any(String),
            createdAt: expect.any(String)
          })
        )
        .then(() =>
          User.findById(tmpUser, { 'company.name': 1 }).then(data => expect(data.company.name).toBe('updated'))
        );
    });

    test('Cannot change type', () =>
      agent
        .patch(`/companies/${company1.id}`)
        .send({ type: 'type2' })
        .set('Cookie', `accessToken=${token}`)
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 202,
            message: 'Additional parameters are not permitted',
            data: '/type'
          })
        ));

    test('Phone must be valid', () =>
      agent
        .patch(`/companies/${company1.id}`)
        .send({ phone: 'test' })
        .set('Cookie', `accessToken=${token}`)
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/phone'
          })
        ));

    test('Update pic', () =>
      agent
        .patch(`/companies/${company1.id}`)
        .send({ pic: 'newPic' })
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: company1.id,
            name: 'Company1',
            type: 'type1',
            pic: 'newPic',
            picUrl: 'https://data/images/companies/newPic',
            lang: 'EN',
            zipcode: '12345',
            country: 'IT',
            address: 'Via XYZ 123',
            phone: { prefix: '+39', number: '1234567890', country: 'IT', formatted: '+391234567890' },
            vatNumber: 'IT1234567890',
            updatedAt: expect.any(String),
            createdAt: expect.any(String)
          })
        ));
  });

  describe('DELETE /companies/:id', () => {
    test('Deleting a company deletes all his users (and others linked entities)', async () => {
      const tmpUser = await new User({
        name: 'Tmp',
        lastname: 'User',
        email: 'tmp@tmp.com',
        password: 'testtest',
        company: { id: company1.id, name: 'Company1', type: 'type1', roles: ['user'] }
      }).save();

      return agent
        .delete(`/companies/${company1.id}`)
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res => expect(res.body).toStrictEqual({ message: 'Company deleted successfully' }))
        .then(() => Company.findById(company1.id))
        .then(data => expect(data).toBe(null))
        .then(() => User.findById(tmpUser.id))
        .then(data => expect(data).toBe(null));
    });

    test('Cannot delete twice', () =>
      agent
        .delete(`/companies/${company1.id}`)
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(() => agent.delete(`/companies/${company1.id}`).set('Cookie', `accessToken=${token}`).expect(404)));
  });

  describe('POST /companies/:id/invite', () => {
    test('Superuser invites user in a company', () => {
      let id;
      return agent
        .post(`/companies/${company1.id}/invite`)
        .send({
          email: 'new@company1.com',
          name: 'New',
          lastname: 'User',
          phone: { prefix: '+39', number: '1234567890', country: 'IT' },
          lang: 'en',
          roles: ['admin']
        })
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res => {
          id = res.body._id;
          expect(res.body).toStrictEqual({
            _id: expect.any(String),
            email: 'new@company1.com',
            name: 'New',
            lastname: 'User',
            fullname: 'New User',
            phone: { prefix: '+39', number: '1234567890', country: 'IT', formatted: '+391234567890' },
            lang: 'EN',
            company: {
              id: company1.id,
              name: 'Company1',
              type: 'type1',
              roles: ['admin']
            },
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            active: false
          });
        })
        .then(() => User.findById(id))
        .then(data =>
          expect(JSON.parse(JSON.stringify(data))).toStrictEqual({
            _id: id,
            email: 'new@company1.com',
            name: 'New',
            lastname: 'User',
            fullname: 'New User',
            phone: { prefix: '+39', number: '1234567890', country: 'IT', formatted: '+391234567890' },
            lang: 'EN',
            company: {
              id: company1.id,
              name: 'Company1',
              type: 'type1',
              roles: ['admin']
            },
            roles: [],
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            active: false,
            __v: 0,
            password: expect.any(String),
            deleted: false
          })
        );
    });
  });
});

describe('Role: admin', () => {
  let token;
  let admin;
  beforeEach(() => {
    const AdminCreation = async () => {
      admin = await new User({
        name: 'Admin',
        lastname: 'Admin',
        email: 'admin@meblabs.com',
        password: 'testtest',
        active: true,
        company: {
          id: company1.id,
          name: company1.name,
          roles: ['admin']
        }
      }).save();

      token = genereteAuthToken(admin).token;
    };

    return AdminCreation();
  });

  describe('GET /companies', () => {
    test('Get all companies not allowed', () =>
      agent.get('/companies?sorter=name').set('Cookie', `accessToken=${token}`).expect(403));
  });

  describe('POST /companies', () => {
    test('Create a company not allowed', () =>
      agent.post('/companies').set('Cookie', `accessToken=${token}`).send({ name: 'newCompany' }).expect(403));
  });

  describe('GET /companies/:id', () => {
    test('Get his company', () =>
      agent
        .get(`/companies/${company1.id}`)
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: company1.id,
            name: 'Company1',
            type: 'type1',
            pic: 'companypic',
            picUrl: 'https://data/images/companies/companypic',
            lang: 'EN',
            zipcode: '12345',
            country: 'IT',
            address: 'Via XYZ 123',
            phone: { prefix: '+39', number: '1234567890', country: 'IT', formatted: '+391234567890' },
            vatNumber: 'IT1234567890',
            updatedAt: expect.any(String),
            createdAt: expect.any(String)
          })
        ));

    test('Get another company not allowed', () =>
      agent.get(`/companies/${company2.id}`).set('Cookie', `accessToken=${token}`).expect(401));
  });

  describe('PATCH /companies/:id', () => {
    test('Update his company', () =>
      agent
        .patch(`/companies/${company1.id}`)
        .send({ phone: { prefix: '+39', number: '555555555', country: 'CH' } })
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: company1.id,
            name: 'Company1',
            type: 'type1',
            pic: 'companypic',
            picUrl: 'https://data/images/companies/companypic',
            lang: 'EN',
            zipcode: '12345',
            country: 'IT',
            address: 'Via XYZ 123',
            phone: { prefix: '+39', number: '555555555', country: 'CH', formatted: '+39555555555' },
            vatNumber: 'IT1234567890',
            updatedAt: expect.any(String),
            createdAt: expect.any(String)
          })
        ));

    test('Update another company not allowed', () =>
      agent
        .patch(`/companies/${company2.id}`)
        .send({ phone: { prefix: '+39', number: '1234567890', country: 'IT' } })
        .set('Cookie', `accessToken=${token}`)
        .expect(401));
  });

  describe('DELETE /companies/:id', () => {
    test('Cannot delete his company', () =>
      agent.delete(`/companies/${company1.id}`).set('Cookie', `accessToken=${token}`).expect(403));

    test('Cannot delete another company', () =>
      agent.delete(`/companies/${company2.id}`).set('Cookie', `accessToken=${token}`).expect(403));
  });

  describe('POST /companies/:id/invite', () => {
    test('Admin invites user in his company', () => {
      let id;
      return agent
        .post(`/companies/${company1.id}/invite`)
        .send({
          email: 'new@company1.com',
          name: 'New',
          lastname: 'User',
          phone: { prefix: '+39', number: '1234567890', country: 'IT' },
          lang: 'en',
          roles: ['admin']
        })
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res => {
          id = res.body._id;
          expect(res.body).toStrictEqual({
            _id: expect.any(String),
            email: 'new@company1.com',
            name: 'New',
            lastname: 'User',
            fullname: 'New User',
            phone: { prefix: '+39', number: '1234567890', country: 'IT', formatted: '+391234567890' },
            lang: 'EN',
            company: {
              id: company1.id,
              name: 'Company1',
              type: 'type1',
              roles: ['admin']
            },
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            active: false
          });
        })
        .then(() => User.findById(id))
        .then(data =>
          expect(JSON.parse(JSON.stringify(data))).toStrictEqual({
            _id: id,
            email: 'new@company1.com',
            name: 'New',
            lastname: 'User',
            fullname: 'New User',
            phone: { prefix: '+39', number: '1234567890', country: 'IT', formatted: '+391234567890' },
            lang: 'EN',
            company: {
              id: company1.id,
              name: 'Company1',
              type: 'type1',
              roles: ['admin']
            },
            roles: [],
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            active: false,
            __v: 0,
            password: expect.any(String),
            deleted: false
          })
        );
    });

    test('Admin cannot invite user in another company', async () => {
      const tmpCompany = await new Company({
        name: 'tmpCompany',
        type: 'type2'
      }).save();

      return agent
        .post(`/companies/${tmpCompany.id}/invite`)
        .send({
          email: 'new@company1.com',
          name: 'New',
          lastname: 'User',
          phone: { prefix: '+39', number: '1234567890', country: 'IT' },
          lang: 'en',
          roles: ['admin']
        })
        .set('Cookie', `accessToken=${token}`)
        .expect(401);
    });
  });
});

describe('Role: user', () => {
  let token;
  let user;
  beforeEach(() => {
    const UserCreation = async () => {
      user = await new User({
        name: 'User',
        lastname: 'User',
        email: 'user@meblabs.com',
        password: 'testtest',
        active: true,
        company: {
          id: company1.id,
          name: company1.name,
          roles: ['user']
        }
      }).save();

      token = genereteAuthToken(user).token;
    };

    return UserCreation();
  });

  describe('GET /companies', () => {
    test('Get all companies not allowed', () =>
      agent.get('/companies?sorter=name').set('Cookie', `accessToken=${token}`).expect(403));
  });

  describe('POST /companies', () => {
    test('Create a company not allowed', () =>
      agent.post('/companies').set('Cookie', `accessToken=${token}`).send({ name: 'newCompany' }).expect(403));
  });

  describe('GET /companies/:id', () => {
    test('Get his company', () =>
      agent
        .get(`/companies/${company1.id}`)
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: company1.id,
            name: 'Company1',
            type: 'type1',
            pic: 'companypic',
            picUrl: 'https://data/images/companies/companypic',
            lang: 'EN',
            zipcode: '12345',
            country: 'IT',
            address: 'Via XYZ 123',
            phone: { prefix: '+39', number: '1234567890', country: 'IT', formatted: '+391234567890' },
            vatNumber: 'IT1234567890',
            updatedAt: expect.any(String),
            createdAt: expect.any(String)
          })
        ));

    test('Get another company not allowed', () =>
      agent.get(`/companies/${company2.id}`).set('Cookie', `accessToken=${token}`).expect(401));
  });

  describe('PATCH /companies/:id', () => {
    test('Update his company not allowed', () =>
      agent
        .patch(`/companies/${company1.id}`)
        .send({ phone: { prefix: '+39', number: '1234567890', country: 'IT' } })
        .set('Cookie', `accessToken=${token}`)
        .expect(403));

    test('Update another company not allowed', () =>
      agent
        .patch(`/companies/${company2.id}`)
        .send({ phone: { prefix: '+39', number: '1234567890', country: 'IT' } })
        .set('Cookie', `accessToken=${token}`)
        .expect(403));
  });

  describe('DELETE /companies/:id', () => {
    test('Cannot delete his company', () =>
      agent.delete(`/companies/${company1.id}`).set('Cookie', `accessToken=${token}`).expect(403));

    test('Cannot delete another company', () =>
      agent.delete(`/companies/${company2.id}`).set('Cookie', `accessToken=${token}`).expect(403));
  });

  describe('POST /comanies/:id/invite', () => {
    test('User cannot invite another user', () =>
      agent
        .post(`/companies/${company1.id}/invite`)
        .send({
          email: 'new@company1.com',
          name: 'New',
          lastname: 'User',
          phone: { prefix: '+39', number: '1234567890', country: 'IT' },
          lang: 'en',
          roles: ['user']
        })
        .set('Cookie', `accessToken=${token}`)
        .expect(403));
  });
});

describe('GET /companies/[ID]/pic', () => {
  test('Get pic from user id should be redirect to image', () =>
    agent
      .get(`/companies/${company1.id}/pic`)
      .expect(200)
      .then(res => expect(res.body).toEqual(Company.parseUrl('pic', company1.pic))));

  test('Get pic from invalid user id should be NotFound', () =>
    agent
      .get('/companies/507f1f77bcf86cd799439011/pic')
      .expect(404)
      .then(res => expect(res.body).toEqual(expect.objectContaining({ error: 404 }))));

  test('Get pic from user whitout pic should be NotFound', async () => {
    const tmpCompany = await new Company({ name: 'tmpCompany' }).save();
    return agent
      .get(`/companies/${tmpCompany.id}/pic`)
      .expect(404)
      .then(res => expect(res.body).toEqual(expect.objectContaining({ error: 404 })));
  });
});
