const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const { genereteChangePasswordToken } = require('../helpers/auth');
const app = require('../app');
const db = require('../db/connect-test');
const User = require('../models/user');
const Rt = require('../models/rt');

let agent;

jest.mock('../helpers/secrets.js');

const userInfo = (active = 1, deleted = 0) => {
  const info = {
    email: 'test@meblabs.com',
    password: 'testtest',
    name: 'John',
    lastname: 'Doe',
    lang: 'en',
    active,
    deleted
  };
  return info;
};

const seedUser = async (active = true, deleted = false) => await new User(userInfo(active, deleted)).save();

const newUser = {
  email: 'new@meblabs.com',
  password: 'testtest',
  name: 'Pinco',
  lastname: 'Pallino'
};

beforeAll(async () => await db.connect());
beforeEach(async () => {
  await db.clear();
  agent = supertest.agent(app);
});
afterEach(() => jest.clearAllMocks());
afterAll(async () => await db.close());

describe('POST /auth/login', () => {
  test('Missing credentials', async () => {
    await seedUser();

    return agent
      .post('/auth/login')
      .expect(400)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 201 }));
      });
  });

  test('Invalid email', async () => {
    await seedUser();

    return agent
      .post('/auth/login')
      .send({ email: 'wrong@email', password: 'wrongpwd' })
      .expect(400)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 210, data: '/email' }));
      });
  });

  test('Missing password', async () => {
    await seedUser();

    return agent
      .post('/auth/login')
      .send({ email: 'wrong@email.it' })
      .expect(400)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 201, data: '/password' }));
      });
  });

  test('Wrong email', async () => {
    await seedUser();

    return agent
      .post('/auth/login')
      .send({ email: 'wrong@email.it', password: 'wrongpwd' })
      .expect(400)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 300 }));
      });
  });

  test('Wrong password', async () => {
    await seedUser();

    return agent
      .post('/auth/login')
      .send({ email: 'test@meblabs.com', password: 'wrongpwd' })
      .expect(400)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 301 }));
      });
  });

  test('Inactive account', async () => {
    await seedUser(false, false);

    return agent
      .post('/auth/login')
      .send({ email: 'test@meblabs.com', password: 'testtest' })
      .expect(401)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 302 }));
      });
  });

  test('Deleted account', async () => {
    await seedUser(true, true);

    return agent
      .post('/auth/login')
      .send({ email: 'test@meblabs.com', password: 'testtest' })
      .expect(400)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 303 }));
      });
  });

  test('Login successfully', async () => {
    await seedUser();

    return agent
      .post('/auth/login')
      .send({ email: 'test@meblabs.com', password: 'testtest' })
      .expect(200)
      .then(res => {
        expect(res.headers['set-cookie']).toEqual(expect.arrayContaining([expect.any(String), expect.any(String)]));
        expect(res.body.fullname).toBe('John Doe');
      });
  });
});

describe('GET /auth/check', () => {
  test('Check with valid token should be OK', async () => {
    await seedUser();

    await agent
      .post('/auth/login')
      .send({ email: 'test@meblabs.com', password: 'testtest' })
      .expect(200)
      .then(res => {
        expect(res.headers['set-cookie']).toEqual(expect.arrayContaining([expect.any(String), expect.any(String)]));
        expect(res.body.fullname).toBe('John Doe');
        const token = res.headers['set-cookie'].find(e => e.startsWith('accessToken'));

        return agent.get('/auth/check').set('Cookie', token).expect(200);
      })
      .then(res =>
        expect(res.body).toStrictEqual({
          _id: expect.any(String),
          fullname: 'John Doe',
          lang: 'EN',
          company: { roles: [] },
          createdAt: expect.any(String)
        })
      );
  });

  test('Check without token should be Unauthorized', async () =>
    agent
      .get('/auth/check')
      .expect(401)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 401 }));
      }));

  test('Check with invalid token should be Unauthorized', async () => {
    const token = jwt.sign(
      {
        id: 1,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      {
        expiresIn: parseInt(process.env.JWT_EXPIRES_TIME)
      }
    );

    return agent
      .get('/auth/check')
      .set('Cookie', `accessToken=${token}`)
      .expect(401)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 401 }));
      });
  });
});

describe('GET /auth/email/:email', () => {
  test('Check if email exist should be OK', async () => {
    await seedUser();

    return agent
      .get('/auth/email/' + userInfo().email)
      .expect(200)
      .then(res => {
        expect(res.body.message).toBe('Email exists!');
      });
  });

  test('Check if email exist should be NotFound', async () =>
    agent
      .get('/auth/email/' + userInfo().email)
      .expect(404)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 404 }));
      }));

  test('Check if deleted users email exist should be NotFound', async () => {
    await seedUser(true, true);

    return agent
      .get('/auth/email/' + userInfo().email)
      .expect(404)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 404 }));
      });
  });

  test('Check without email should be NotFound', async () =>
    agent
      .get('/auth/email/')
      .expect(400)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 201, data: '/email' }));
      }));

  test('Check with incorrect email should be ValidationError', async () =>
    agent
      .get('/auth/email/wrong@email')
      .expect(400)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 210, data: '/email' }));
      }));
});

describe('POST /auth/register', () => {
  test('Register new user with email and password should be OK and response with auth token + refresh token', async () => {
    await agent
      .post('/auth/register')
      .send({
        ...newUser,
        lang: 'en'
      })
      .expect(200)
      .then(res => {
        expect(res.headers['set-cookie']).toEqual(expect.arrayContaining([expect.any(String), expect.any(String)]));
        expect(res.body).toEqual(expect.objectContaining({ lang: 'EN' }));

        const token = res.headers['set-cookie'].find(e => e.startsWith('accessToken'));

        return agent.get('/auth/check').set('Cookie', token).expect(200);
      });
  });

  test('Register new user with email that already exist should be EmailAlreadyExists', async () => {
    await seedUser();

    return agent
      .post('/auth/register')
      .send({
        email: 'test@meblabs.com',
        password: 'testtest',
        name: 'Tizio',
        lastname: 'Incognito',
        lang: 'en'
      })
      .expect(400)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 304 }));
      });
  });

  test('Register new user with email of deleted account should be DeletedUser', async () => {
    await seedUser(true, true);

    return agent
      .post('/auth/register')
      .send({
        email: 'test@meblabs.com',
        password: 'testtest',
        name: 'Tizio',
        lastname: 'Incognito',
        lang: 'en'
      })
      .expect(400)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 303 }));
      });
  });

  test('Register new user without email should be MissingRequiredParameter', async () =>
    agent
      .post('/auth/register')
      .expect(400)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 201, data: '/email' }));
      }));

  test('Register new user without password should be MissingRequiredParameter', async () =>
    agent
      .post('/auth/register')
      .send({ email: 'test@meblabs.com' })
      .expect(400)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 201, data: '/password' }));
      }));

  test('Register new user with incorrect email should be ValidationError', async () =>
    agent
      .post('/auth/register')
      .send({ email: 'wrong@email', password: 'testtest' })
      .expect(400)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 210, data: '/email' }));
      }));

  test('Register new user with not send lang filed has registered as "en"', () =>
    agent
      .post('/auth/register')
      .send(newUser)
      .expect(200)
      .then(res => {
        expect(res.headers['set-cookie']).toEqual(expect.arrayContaining([expect.any(String), expect.any(String)]));
        expect(res.body).toEqual(expect.objectContaining({ lang: 'EN' }));
      }));

  test('Register new user with supported lang "it"', async () =>
    agent
      .post('/auth/register')
      .send({
        ...newUser,
        lang: 'it'
      })
      .expect(200)
      .then(res => {
        expect(res.headers['set-cookie']).toEqual(expect.arrayContaining([expect.any(String), expect.any(String)]));
        expect(res.body).toEqual(expect.objectContaining({ lang: 'IT' }));
      }));

  test('Register new user with not supported lang has registered as "en" ', async () =>
    agent
      .post('/auth/register')
      .send({
        ...newUser,
        lang: 'de'
      })
      .expect(200)
      .then(res => {
        expect(res.headers['set-cookie']).toEqual(expect.arrayContaining([expect.any(String), expect.any(String)]));
        expect(res.body).toEqual(expect.objectContaining({ lang: 'EN' }));
      }));
});

describe('GET /auth/rt', () => {
  test('Get new auth with valid refresh token should be OK', async () => {
    const user = await seedUser();

    await agent
      .post('/auth/login')
      .send({ email: 'test@meblabs.com', password: 'testtest' })
      .expect(200)
      .then(res => {
        expect(res.headers['set-cookie']).toEqual(expect.arrayContaining([expect.any(String), expect.any(String)]));
        expect(res.body).toEqual(expect.objectContaining({ fullname: 'John Doe' }));

        const token = res.headers['set-cookie'].find(e => e.startsWith('refreshToken'));
        return agent.get('/auth/rt').set('Cookie', token).expect(200);
      })
      .then(res => {
        expect(res.headers['set-cookie']).toEqual(expect.arrayContaining([expect.any(String), expect.any(String)]));
        expect(res.body).toEqual(expect.objectContaining({ fullname: 'John Doe' }));

        const token = res.headers['set-cookie'].find(e => e.startsWith('accessToken'));

        return agent.get('/auth/check').set('Cookie', token).expect(200);
      })
      .then(res => {
        expect(res.body._id).toBeTruthy();
      });

    const refreshUser = await Rt.find({ user: user._id });
    expect(refreshUser.length).toEqual(1);
  });

  test('Get new auth with invalid refresh should be Unauthorized', async () => {
    await seedUser();
    const rt = jwt.sign(
      {
        userID: 1,
        rt: 1234,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      {
        expiresIn: parseInt(process.env.JWT_EXPIRES_TIME)
      }
    );

    return agent
      .get('/auth/rt')
      .set('Cookie', `refreshToken=${rt}`)
      .expect(401)
      .then(res => {
        expect(res.body).toStrictEqual({ error: 308, data: {}, message: 'Unauthorized refresh token' });
      });
  });

  test('Get new auth with expired refresh should be Unauthorized', async () => {
    const user = await seedUser();
    let token;
    await agent
      .post('/auth/login')
      .send({ email: 'test@meblabs.com', password: 'testtest' })
      .expect(200)
      .then(res => {
        expect(res.headers['set-cookie']).toEqual(expect.arrayContaining([expect.any(String), expect.any(String)]));
        expect(res.body).toEqual(expect.objectContaining({ fullname: 'John Doe' }));
        token = res.headers['set-cookie'].find(e => e.startsWith('refreshToken'));
      });

    const refreshUser = await Rt.find({ user: user._id });
    expect(refreshUser.length).toBe(1);

    const rt = await Rt.findById(refreshUser[0]._id);
    rt.expires = dayjs().subtract(1, 's').format();
    await rt.save();

    return agent
      .get('/auth/rt')
      .set('Cookie', token)
      .expect(401)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 307 }));
      });
  });
});

describe('GET /auth/logout', () => {
  test('Destroy refresh token on logout and clear http only cookie', async () => {
    const user = await seedUser();

    await agent
      .post('/auth/login')
      .send({ email: 'test@meblabs.com', password: 'testtest' })
      .expect(200)
      .then(async res => {
        expect(res.headers['set-cookie']).toEqual(expect.arrayContaining([expect.any(String), expect.any(String)]));
        expect(res.body).toEqual(expect.objectContaining({ fullname: 'John Doe' }));
        const refreshToken = res.headers['set-cookie'].find(e => e.startsWith('refreshToken'));

        const refreshUser = await User.findById(user._id).lean();
        expect(refreshUser.authReset).not.toBeDefined();

        const tokens = await Rt.find({ user: user._id });
        expect(tokens.length).toEqual(1);

        return agent.get('/auth/logout').set('Cookie', refreshToken).expect(200);
      })
      .then(res => {
        expect(res.body.message).toBe('Logout succesfully!');
      });

    const refreshUser = await User.findById(user._id).lean();
    expect(refreshUser.authReset).not.toBeDefined();
    const tokens = await Rt.find({ user: user._id });
    expect(tokens.length).toEqual(0);
  });
});

describe('PATCH /auth/changePassword/:email/:token', () => {
  test('Change password successfully', async () => {
    const user = await new User({ email: 'test@user.com', password: 'testtest', active: true }).save();
    const { token } = genereteChangePasswordToken(user);

    return agent
      .patch(`/auth/changePassword/${user.email}/${btoa(token)}`)
      .send({ password: 'test' })
      .expect(200)
      .then(() => agent.post('/auth/login').send({ email: user.email, password: 'test' }).expect(200))
      .then(res => {
        expect(res.headers['set-cookie']).toEqual(expect.arrayContaining([expect.any(String), expect.any(String)]));
      });
  });

  test('Change password of non existing user', async () => {
    const user = await new User({
      email: 'test@user.meblabs.com',
      password: 'testtest'
    }).save();
    await user.softDelete();

    const { token } = genereteChangePasswordToken(user);
    return agent
      .patch(`/auth/changePassword/${user.email}/${btoa(token)}`)
      .send({ password: 'test' })
      .expect(401);
  });

  test('Change password with malformed param :email', async () => {
    const user = await new User({ email: 'test@user.meblabs.com', password: 'testtest' }).save();
    const { token } = genereteChangePasswordToken(user);
    return agent
      .patch(`/auth/changePassword/1234@test/${btoa(token)}`)
      .send({ password: 'test' })
      .expect(400)
      .then(res => {
        expect(res.body).toEqual(expect.objectContaining({ error: 200 }));
      });
  });

  test('Change password with malformed body', async () => {
    const user = await new User({ email: 'test@user.meblabs.com', password: 'testtest' }).save();
    const { token } = genereteChangePasswordToken(user);
    return agent
      .patch(`/auth/changePassword/${user.email}/${btoa(token)}`)
      .send({ email: 'test' })
      .expect(400)
      .then(res => {
        expect(res.body).toStrictEqual({
          data: '/password',
          error: 201,
          message: 'Missing required parameters'
        });
      });
  });

  test('Change password user with authReset', async () => {
    const user = await new User({ email: 'test@user.meblabs.com', password: 'testtest', authReset: new Date() }).save();
    const { token } = genereteChangePasswordToken(user);
    return agent
      .patch(`/auth/changePassword/${user.email}/${btoa(token)}`)
      .send({ password: 'test' })
      .expect(200)
      .then(() => User.findById(user.id))
      .then(data => {
        expect(data.authReset).toBe(null);
      });
  });

  test('Change password with invalid token', async () => {
    const user = await new User({ email: 'test@user.meblabs.com', password: 'testtest' }).save();
    let { token } = genereteChangePasswordToken(user);
    token = `${token}mods`;

    const token1 =
      // eslint-disable-next-line max-len
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    return agent
      .patch(`/auth/changePassword/${user.email}/${btoa(token)}`)
      .send({ password: 'test' })
      .expect(401)
      .then(() =>
        agent
          .patch(`/auth/changePassword/${user.email}/${btoa(token1)}`)
          .send({ password: 'test' })
          .expect(401)
      );
  });

  test('Change password with used token', async () => {
    const user = await new User({ email: 'test@user.com', password: 'testtest', active: true }).save();
    const { token } = genereteChangePasswordToken(user);

    return agent
      .patch(`/auth/changePassword/${user.email}/${btoa(token)}`)
      .send({ password: 'test' })
      .expect(200)
      .then(() => agent.post('/auth/login').send({ email: user.email, password: 'test' }).expect(200))
      .then(res => {
        expect(res.headers['set-cookie']).toEqual(expect.arrayContaining([expect.any(String), expect.any(String)]));
        return agent
          .patch(`/auth/changePassword/${user.email}/${btoa(token)}`)
          .send({ password: 'test' })
          .expect(401);
      });
  });
});

describe('POST /auth/forgotPassword', () => {
  test('Send recover email correctly', async () => {
    await seedUser();

    return agent.post('/auth/forgotPassword').send({ email: userInfo().email }).expect(200);
  });

  test('The user is deleted', async () => {
    await seedUser(false, true);

    return agent.post('/auth/forgotPassword').send({ email: userInfo().email }).expect(404);
  });
});

describe('POST /restoreUser', () => {
  test('Send restore user email correctly', async () => {
    await seedUser(false, true);

    return agent.post('/auth/restoreUser').send({ email: userInfo().email }).expect(200);
  });

  test('The user is not deleted', async () => {
    await seedUser();

    return agent.post('/auth/restoreUser').send({ email: userInfo().email }).expect(404);
  });
});
