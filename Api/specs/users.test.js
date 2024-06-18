const supertest = require('supertest');

const app = require('../app');
const db = require('../db/connect-test');
const User = require('../models/user');
const Company = require('../models/company');
const { genereteAuthToken } = require('../helpers/auth');

const agent = supertest.agent(app);

let company1;
let admin;
let adminToken;
let user;
let userToken;

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

  const AdminCreation = async () => {
    admin = await new User({
      email: 'admin@company1.com',
      password: 'testtest',
      name: 'Admin',
      lastname: 'User',
      phone: { prefix: '+39', number: '1234567890', country: 'IT' },
      lang: 'EN',
      active: true,
      company: {
        id: company1.id,
        name: 'Company1',
        type: 'type1',
        roles: ['admin']
      }
    }).save();

    adminToken = genereteAuthToken(admin).token;
  };

  const UserCreation = async () => {
    user = await new User({
      email: 'user@company1.com',
      password: 'testtest',
      name: 'User',
      lastname: 'User',
      phone: { prefix: '+02', number: '7894561230', country: 'IT' },
      lang: 'EN',
      active: true,
      company: {
        id: company1.id,
        name: 'Company1',
        type: 'type1',
        roles: ['user']
      }
    }).save();

    userToken = genereteAuthToken(user).token;
  };

  return Company1Creation().then(() => Promise.all([AdminCreation(), UserCreation()]));
});
afterEach(() => jest.clearAllMocks());
afterAll(async () => await db.close());

describe('Role: Superuser', () => {
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

  describe('GET /users', () => {
    test('Get all allowed', () =>
      agent
        .get('/users?sorter=name')
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res => {
          expect(res.body).toStrictEqual([
            {
              _id: admin.id,
              email: 'admin@company1.com',
              name: 'Admin',
              lastname: 'User',
              fullname: 'Admin User',
              active: true,
              company: {
                id: company1.id,
                roles: ['admin'],
                type: 'type1',
                name: 'Company1'
              },
              createdAt: expect.any(String)
            },
            {
              _id: superuser.id,
              name: 'Super',
              lastname: 'Admin',
              email: 'superuser@meblabs.com',
              fullname: 'Super Admin',
              active: true,
              company: { roles: [] },
              createdAt: expect.any(String)
            },
            {
              _id: user.id,
              email: 'user@company1.com',
              name: 'User',
              lastname: 'User',
              fullname: 'User User',
              active: true,
              company: {
                id: company1.id,
                roles: ['user'],
                type: 'type1',
                name: 'Company1'
              },
              createdAt: expect.any(String)
            }
          ]);
        }));

    test('Get all filterd', () =>
      agent
        .get('/users?sorter=name&filter=A')
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res => {
          expect(res.body).toStrictEqual([
            {
              _id: admin.id,
              email: 'admin@company1.com',
              name: 'Admin',
              lastname: 'User',
              fullname: 'Admin User',
              active: true,
              company: {
                id: company1.id,
                roles: ['admin'],
                type: 'type1',
                name: 'Company1'
              },
              createdAt: expect.any(String)
            },
            {
              _id: superuser.id,
              name: 'Super',
              lastname: 'Admin',
              email: 'superuser@meblabs.com',
              fullname: 'Super Admin',
              active: true,
              company: { roles: [] },
              createdAt: expect.any(String)
            }
          ]);
        }));
  });

  describe('GET /companies/:id/users', () => {
    test('Get all and should contains two users', () =>
      agent
        .get(`/companies/${company1.id}/users?sorter=name`)
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res => {
          expect(res.body).toStrictEqual([
            {
              _id: admin.id,
              email: 'admin@company1.com',
              name: 'Admin',
              lastname: 'User',
              fullname: 'Admin User',
              active: true,
              createdAt: expect.any(String)
            },
            {
              _id: user.id,
              email: 'user@company1.com',
              name: 'User',
              lastname: 'User',
              fullname: 'User User',
              active: true,
              createdAt: expect.any(String)
            }
          ]);
        }));

    test('Get all and should contains two users', () =>
      agent
        .get(`/companies/${company1.id}/users?sorter=-name&limit=1&count=true`)
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res => {
          expect(res.body).toStrictEqual([
            {
              _id: user.id,
              email: 'user@company1.com',
              name: 'User',
              lastname: 'User',
              fullname: 'User User',
              active: true,
              createdAt: expect.any(String)
            }
          ]);
          const nextKey = res.headers['x-next-key'];
          expect(JSON.parse(nextKey)).toStrictEqual({ _id: expect.any(String), name: 'User' });
          expect(res.headers['x-total-count']).toBe('2');

          return agent
            .get(`/companies/${company1.id}/users?sorter=-name&limit=1&nextKey=${nextKey}`)
            .set('Cookie', `accessToken=${adminToken}`)
            .expect(200);
        })
        .then(res =>
          expect(res.body).toStrictEqual([
            {
              _id: admin.id,
              email: 'admin@company1.com',
              name: 'Admin',
              lastname: 'User',
              fullname: 'Admin User',
              active: true,
              createdAt: expect.any(String)
            }
          ])
        ));
  });

  describe('GET /users/:id', () => {
    test('Get any specific userId should be done with correct cp fields', () =>
      agent
        .get(`/users/${user.id}`)
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: user.id,
            email: 'user@company1.com',
            name: 'User',
            lastname: 'User',
            fullname: 'User User',
            phone: { prefix: '+02', number: '7894561230', country: 'IT', formatted: '+027894561230' },
            lang: 'EN',
            company: {
              id: company1.id,
              name: 'Company1',
              type: 'type1',
              roles: ['user']
            },
            active: true,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ));

    test('Get himself should be done with correct cp fields', () =>
      agent
        .get(`/users/${admin.id}`)
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: admin.id,
            email: 'admin@company1.com',
            name: 'Admin',
            lastname: 'User',
            fullname: 'Admin User',
            phone: { prefix: '+39', number: '1234567890', country: 'IT', formatted: '+391234567890' },
            lang: 'EN',
            company: {
              id: company1.id,
              name: 'Company1',
              roles: ['admin'],
              type: 'type1'
            },
            active: true,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ));

    test('Get users from another company', async () => {
      const tmpCompany = await new Company({ name: 'tmpCompany' }).save();
      const tmpUser = await new User({
        email: 'tmp@companyTmp.com',
        password: 'testest',
        company: { id: tmpCompany.id, roles: ['user'], name: tmpCompany.name }
      }).save();
      return agent
        .get(`/users/${tmpUser.id}`)
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res => {
          expect(res.body).toStrictEqual({
            _id: tmpUser.id,
            email: 'tmp@companytmp.com',
            lang: 'EN',
            fullname: '',
            company: {
              id: tmpCompany.id,
              roles: ['user'],
              name: tmpCompany.name
            },
            active: false,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          });
        });
    });

    test('Get wrong userId should be ValidationError', () =>
      agent
        .get('/users/1234')
        .set('Cookie', `accessToken=${token}`)
        .expect(400)
        .then(res => {
          expect(res.body).toEqual(expect.objectContaining({ error: 200 }));
        }));

    test('Get inexistent userId should be NotFound', () =>
      agent
        .get('/users/507f1f77bcf86cd799439011')
        .set('Cookie', `accessToken=${token}`)
        .expect(404)
        .then(res => {
          expect(res.body).toEqual(expect.objectContaining({ error: 404 }));
        }));

    test('Get deleted user should be NotFound', async () => {
      await agent
        .delete(`/users/${user.id}`)
        .set('Cookie', `accessToken=${token}`)
        .send({ name: 'edit' })
        .expect(200)
        .then(res => {
          expect(res.body.message).toBe('User deleted successfully');
        });

      return agent
        .get(`/users/${user.id}`)
        .set('Cookie', `accessToken=${token}`)
        .expect(404)
        .then(res => {
          expect(res.body).toEqual(expect.objectContaining({ error: 404 }));
        });
    });
  });

  describe('PATCH /users', () => {
    test('Any users should be changed', () =>
      agent
        .patch(`/users/${user.id}`)
        .set('Cookie', `accessToken=${token}`)
        .send({ name: 'edit' })
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: user.id,
            email: 'user@company1.com',
            name: 'edit',
            fullname: 'edit User',
            lastname: 'User',
            phone: { prefix: '+02', number: '7894561230', country: 'IT', formatted: '+027894561230' },
            lang: 'EN',
            company: {
              id: company1.id,
              name: 'Company1',
              type: 'type1',
              roles: ['user']
            },
            active: true,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ));

    test('Update wrong userId should be ValidationError', () =>
      agent
        .patch('/users/1234')
        .set('Cookie', `accessToken=${token}`)
        .send({ name: 'edit' })
        .expect(400)
        .then(res => expect(res.body).toEqual(expect.objectContaining({ error: 200 }))));

    test('Update inexistent userId should be NotFound', () =>
      agent
        .patch('/users/507f1f77bcf86cd799439011')
        .set('Cookie', `accessToken=${token}`)
        .send({ name: 'edit' })
        .expect(404)
        .then(res => expect(res.body).toEqual(expect.objectContaining({ error: 404 }))));

    test('Update deleted user should be NotFound', async () => {
      await agent
        .delete(`/users/${user.id}`)
        .set('Cookie', `accessToken=${token}`)
        .send({ name: 'edit' })
        .expect(200)
        .then(res => {
          expect(res.body.message).toBe('User deleted successfully');
        });

      return agent
        .delete(`/users/${user.id}`)
        .set('Cookie', `accessToken=${token}`)
        .send({ name: 'edit' })
        .expect(404)
        .then(res => expect(res.body).toEqual(expect.objectContaining({ error: 404 })));
    });

    test('Cannot send email in update', () =>
      agent
        .patch(`/users/${user.id}`)
        .set('Cookie', `accessToken=${token}`)
        .send({ email: 'wrong' })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 202,
            data: '/email',
            message: 'Additional parameters are not permitted'
          })
        ));
  });

  describe('DELETE /users', () => {
    test('Any users should be deleted', async () => {
      await agent
        .delete(`/users/${admin.id}`)
        .set('Cookie', `accessToken=${token}`)
        .send({ name: 'edit' })
        .expect(200)
        .then(res => {
          expect(res.body.message).toBe('User deleted successfully');
        });

      return agent
        .get(`/users/${admin.id}`)
        .set('Cookie', `accessToken=${token}`)
        .expect(404)
        .then(res => {
          expect(res.body).toEqual(expect.objectContaining({ error: 404 }));
        });
    });

    test('Delete wrong userId should be ValidationError', done => {
      agent
        .delete('/users/1234')
        .set('Cookie', `accessToken=${token}`)
        .send({ name: 'edit' })
        .expect(400)
        .then(res => {
          expect(res.body).toEqual(expect.objectContaining({ error: 200 }));
          done();
        });
    });

    test('Delete inexistent userId should be NotFound', done => {
      agent
        .delete('/users/507f1f77bcf86cd799439011')
        .set('Cookie', `accessToken=${token}`)
        .send({ name: 'edit' })
        .expect(404)
        .then(res => {
          expect(res.body).toEqual(expect.objectContaining({ error: 404 }));
          done();
        });
    });

    test('Soft deleted: after delete user with GET does not return', async () => {
      await agent
        .delete(`/users/${user.id}`)
        .set('Cookie', `accessToken=${token}`)
        .send({ name: 'edit' })
        .expect(200)
        .then(res => {
          expect(res.body.message).toBe('User deleted successfully');
        });

      return agent
        .get(`/companies/${company1.id}/users`)
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res => {
          expect(res.body.length).toBe(1);
        });
    });
  });
});

describe('Role: Admin', () => {
  describe('GET /users', () => {
    test('Get all is not allowed', () =>
      agent
        .get('/users?sorter=name')
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(403)
        .then(res => {
          expect(res.body).toStrictEqual({
            error: 403,
            message: 'Forbidden',
            data: {}
          });
        }));
  });

  describe('GET /companies/:id/users', () => {
    test('Get all and should contains two users', () =>
      agent
        .get(`/companies/${company1.id}/users?sorter=name`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res => {
          expect(res.body).toStrictEqual([
            {
              _id: admin.id,
              email: 'admin@company1.com',
              name: 'Admin',
              lastname: 'User',
              fullname: 'Admin User',
              active: true,
              createdAt: expect.any(String)
            },
            {
              _id: user.id,
              email: 'user@company1.com',
              name: 'User',
              lastname: 'User',
              fullname: 'User User',
              active: true,
              createdAt: expect.any(String)
            }
          ]);
        }));

    test('Get all and should contains two users reverse', () =>
      agent
        .get(`/companies/${company1.id}/users?sorter=-name&limit=1&count=true`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res => {
          expect(res.body).toStrictEqual([
            {
              _id: user.id,
              email: 'user@company1.com',
              name: 'User',
              lastname: 'User',
              fullname: 'User User',
              active: true,
              createdAt: expect.any(String)
            }
          ]);
          const nextKey = res.headers['x-next-key'];
          expect(JSON.parse(nextKey)).toStrictEqual({ _id: expect.any(String), name: 'User' });
          expect(res.headers['x-total-count']).toBe('2');

          return agent
            .get(`/companies/${company1.id}/users?sorter=-name&limit=1&nextKey=${nextKey}`)
            .set('Cookie', `accessToken=${adminToken}`)
            .expect(200);
        })
        .then(res =>
          expect(res.body).toStrictEqual([
            {
              _id: admin.id,
              email: 'admin@company1.com',
              name: 'Admin',
              lastname: 'User',
              fullname: 'Admin User',
              active: true,
              createdAt: expect.any(String)
            }
          ])
        ));

    test('Get all filter', () =>
      agent
        .get(`/companies/${company1.id}/users?sorter=name&filter=A`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual([
            {
              _id: admin.id,
              email: 'admin@company1.com',
              name: 'Admin',
              lastname: 'User',
              fullname: 'Admin User',
              active: true,
              createdAt: expect.any(String)
            }
          ])
        ));
  });

  describe('GET /users/:id', () => {
    test('Get any specific userId should be done with correct cp fields', () =>
      agent
        .get(`/users/${user.id}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: user.id,
            email: 'user@company1.com',
            name: 'User',
            lastname: 'User',
            fullname: 'User User',
            phone: { prefix: '+02', number: '7894561230', country: 'IT', formatted: '+027894561230' },
            lang: 'EN',
            company: {
              id: company1.id,
              name: 'Company1',
              type: 'type1',
              roles: ['user']
            },
            active: true,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ));

    test('Get himself should be done with correct cp fields', () =>
      agent
        .get(`/users/${admin.id}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: admin.id,
            email: 'admin@company1.com',
            name: 'Admin',
            lastname: 'User',
            fullname: 'Admin User',
            phone: { prefix: '+39', number: '1234567890', country: 'IT', formatted: '+391234567890' },
            lang: 'EN',
            company: {
              id: company1.id,
              name: 'Company1',
              type: 'type1',
              roles: ['admin']
            },
            active: true,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ));

    test('Cannot get users from another company', async () => {
      const tmpCompany = await new Company({ name: 'tmpCompany' }).save();
      const tmpUser = await new User({
        email: 'tmp@companyTmp.com',
        password: 'testest',
        company: { id: tmpCompany.id, roles: ['user'] }
      }).save();
      return agent
        .get(`/users/${tmpUser.id}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(401)
        .then(res => {
          expect(res.body).toStrictEqual({
            error: 401,
            message: 'Unauthorized',
            data: {}
          });
        });
    });

    test('Get wrong userId should be ValidationError', () =>
      agent
        .get('/users/1234')
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(400)
        .then(res => {
          expect(res.body).toEqual(expect.objectContaining({ error: 200 }));
        }));

    test('Get inexistent userId should be NotFound', () =>
      agent
        .get('/users/507f1f77bcf86cd799439011')
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(404)
        .then(res => {
          expect(res.body).toEqual(expect.objectContaining({ error: 404 }));
        }));

    test('Get deleted user should be NotFound', async () => {
      await agent
        .delete(`/users/${user.id}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ name: 'edit' })
        .expect(200)
        .then(res => {
          expect(res.body.message).toBe('User deleted successfully');
        });

      return agent
        .get(`/users/${user.id}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(404)
        .then(res => {
          expect(res.body).toEqual(expect.objectContaining({ error: 404 }));
        });
    });
  });

  describe('PATCH /users', () => {
    test('His data should be changed', () =>
      agent
        .patch(`/users/${admin.id}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ name: 'edit' })
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: admin.id,
            email: 'admin@company1.com',
            name: 'edit',
            fullname: 'edit User',
            lastname: 'User',
            phone: { prefix: '+39', number: '1234567890', country: 'IT', formatted: '+391234567890' },
            lang: 'EN',
            company: {
              id: company1.id,
              name: 'Company1',
              type: 'type1',
              roles: ['admin']
            },
            active: true,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ));

    test('Any users should be changed', () =>
      agent
        .patch(`/users/${user.id}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ name: 'edit' })
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: user.id,
            email: 'user@company1.com',
            name: 'edit',
            fullname: 'edit User',
            lastname: 'User',
            phone: { prefix: '+02', number: '7894561230', country: 'IT', formatted: '+027894561230' },
            lang: 'EN',
            company: {
              id: company1.id,
              name: 'Company1',
              type: 'type1',
              roles: ['user']
            },
            active: true,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ));

    test('Cannot update users from other companies', async () => {
      const tmpUser = await new User({ name: 'tmpUser', password: 'testtest' }).save();

      return agent
        .patch(`/users/${tmpUser.id}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ name: 'edit' })
        .expect(401);
    });
  });

  describe('DELETE /users', () => {
    test('His data should be deleted', async () => {
      await agent
        .delete(`/users/${admin.id}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ name: 'edit' })
        .expect(200)
        .then(res => {
          expect(res.body.message).toBe('User deleted successfully');
        });
    });

    test('Any users should be deleted', async () => {
      await agent
        .delete('/users/' + user.id)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ name: 'edit' })
        .expect(200)
        .then(res => {
          expect(res.body.message).toBe('User deleted successfully');
        });

      return agent
        .get(`/users/${user.id}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(404)
        .then(res => {
          expect(res.body).toEqual(expect.objectContaining({ error: 404 }));
        });
    });

    test('Soft deleted: after delete user with GET does not return', async () => {
      await agent
        .delete(`/users/${user.id}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ name: 'edit' })
        .expect(200)
        .then(res => {
          expect(res.body.message).toBe('User deleted successfully');
        });

      return agent
        .get(`/companies/${company1.id}/users`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res => {
          expect(res.body.length).toBe(1);
        });
    });
  });
});

describe('Role: User', () => {
  describe('GET /users', () => {
    test('Get users not allowed', () =>
      agent
        .get(`/users`)
        .set('Cookie', `accessToken=${userToken}`)
        .expect(403)
        .then(res => {
          expect(res.body).toStrictEqual({
            error: 403,
            message: 'Forbidden',
            data: {}
          });
        }));
  });

  describe('GET /users/:id', () => {
    test('Get himself with success', () =>
      agent
        .get(`/users/${user.id}`)
        .set('Cookie', `accessToken=${userToken}`)
        .expect(200)
        .then(res => {
          expect(res.body).toStrictEqual({
            _id: user.id,
            email: 'user@company1.com',
            name: 'User',
            fullname: 'User User',
            lastname: 'User',
            phone: { prefix: '+02', number: '7894561230', country: 'IT', formatted: '+027894561230' },
            lang: 'EN',
            company: {
              id: company1.id,
              name: 'Company1',
              type: 'type1',
              roles: ['user']
            },
            active: true,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          });
        }));

    test('Cannot get users from his company', () =>
      agent
        .get(`/users/${admin.id}`)
        .set('Cookie', `accessToken=${userToken}`)
        .expect(401)
        .then(res => {
          expect(res.body).toStrictEqual({
            error: 401,
            message: 'Unauthorized',
            data: {}
          });
        }));

    test('Cannot get users from another company', async () => {
      const tmpCompany = await new Company({ name: 'tmpCompany' }).save();
      const tmpUser = await new User({
        email: 'tmp@companyTmp.com',
        password: 'testest',
        company: { id: tmpCompany.id, roles: ['user'] }
      }).save();
      return agent
        .get(`/users/${tmpUser.id}`)
        .set('Cookie', `accessToken=${userToken}`)
        .expect(401)
        .then(res => {
          expect(res.body).toStrictEqual({
            error: 401,
            message: 'Unauthorized',
            data: {}
          });
        });
    });
  });

  describe('GET /companies/:id/users', () => {
    test('Get all and should contains two users', () =>
      agent
        .get(`/companies/${company1.id}/users?sorter=name`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res => {
          expect(res.body).toStrictEqual([
            {
              _id: admin.id,
              email: 'admin@company1.com',
              name: 'Admin',
              lastname: 'User',
              fullname: 'Admin User',
              active: true,
              createdAt: expect.any(String)
            },
            {
              _id: user.id,
              email: 'user@company1.com',
              name: 'User',
              lastname: 'User',
              fullname: 'User User',
              active: true,
              createdAt: expect.any(String)
            }
          ]);
        }));

    test('Get all and should contains two users', () =>
      agent
        .get(`/companies/${company1.id}/users?sorter=-name&limit=1&count=true`)
        .set('Cookie', `accessToken=${userToken}`)
        .expect(200)
        .then(res => {
          expect(res.body).toStrictEqual([
            {
              _id: user.id,
              email: 'user@company1.com',
              name: 'User',
              lastname: 'User',
              fullname: 'User User',
              active: true,
              createdAt: expect.any(String)
            }
          ]);
          const nextKey = res.headers['x-next-key'];
          expect(JSON.parse(nextKey)).toStrictEqual({ _id: expect.any(String), name: 'User' });
          expect(res.headers['x-total-count']).toBe('2');

          return agent
            .get(`/companies/${company1.id}/users?sorter=-name&limit=1&nextKey=${nextKey}`)
            .set('Cookie', `accessToken=${userToken}`)
            .expect(200);
        })
        .then(res =>
          expect(res.body).toStrictEqual([
            {
              _id: admin.id,
              email: 'admin@company1.com',
              name: 'Admin',
              lastname: 'User',
              fullname: 'Admin User',
              active: true,
              createdAt: expect.any(String)
            }
          ])
        ));
  });

  describe('PATCH /users', () => {
    test('Update himself with success', () =>
      agent
        .patch(`/users/${user.id}`)
        .set('Cookie', `accessToken=${userToken}`)
        .send({ name: 'edit' })
        .expect(200)
        .then(res => {
          expect(res.body).toStrictEqual({
            _id: user.id,
            email: 'user@company1.com',
            name: 'edit',
            fullname: 'edit User',
            lastname: 'User',
            phone: { prefix: '+02', number: '7894561230', country: 'IT', formatted: '+027894561230' },
            lang: 'EN',
            company: {
              id: company1.id,
              name: 'Company1',
              type: 'type1',
              roles: ['user']
            },
            active: true,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          });
        }));

    test('Upadate user of his company failing', () =>
      agent.patch(`/users/${admin.id}`).set('Cookie', `accessToken=${userToken}`).send({ name: 'edit' }).expect(401));

    test('Upadate user of another company failing', async () => {
      const tmpCompany = await new Company({ name: 'tmpCompany' }).save();
      const tmpUser = await new User({
        email: 'tmp@companyTmp.com',
        password: 'testest',
        company: { id: tmpCompany.id, roles: ['user'] }
      }).save();
      return agent
        .patch(`/users/${tmpUser.id}`)
        .set('Cookie', `accessToken=${userToken}`)
        .send({ name: 'edit' })
        .expect(401);
    });
  });

  describe('DELETE /users', () => {
    test('Delete himself not permitted', () =>
      agent.delete(`/users/${user.id}`).set('Cookie', `accessToken=${userToken}`).expect(403));

    test('Delete user of his company with failing', () =>
      agent.delete(`/users/${admin.id}`).set('Cookie', `accessToken=${userToken}`).expect(403));

    test('Delete user of another company failing', async () => {
      const tmpCompany = await new Company({ name: 'tmpCompany' }).save();
      const tmpUser = await new User({
        email: 'tmp@companyTmp.com',
        password: 'testest',
        company: { id: tmpCompany.id, roles: ['user'] }
      }).save();
      return agent.delete(`/users/${tmpUser.id}`).set('Cookie', `accessToken=${userToken}`).expect(403);
    });
  });
});
