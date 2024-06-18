# Fullstack Test Api

The backend folder for the fullstack test, built with Node.js, is accessible at [http://localhost:3000](http://localhost:3000) when Docker is running.

## Requirements

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

## Prepare Project

```sh
npm ci
```

---

# Optional Features and Helpers

## MongoDB

### Seed

```sh
npm run seed
```

### Migrations

```sh
npm run migrate:create <migration-name>
```

To create a new migration [db/migrations/timestamp-name.js]

```sh
npm run migrate:up <migration-name>
```

To run all migrations up to migration-name, if no migration is specified all migrations are run

```sh
npm run migrate:down <migration-name>
```

To undo all migrations down to migration-name, if no migration is specified all migrations are run

### Object Ids

Sub documents and normalized documents are always called with the name of the referred model (No 'Id' in the name). If it is a normalized field, it will contains the `id` key to the referred object.
E.g.

```js
const withNormalized = new Schema(
	...
	manufacturer: {
		id: ObjectId,
		otherFields: ....
	}
	...
)

const fullReference = new Schema(
	...
	manufacturer: ObjectId,
	....
)
```

In the second case if we have a populate, the populated object will be in the key called with the same name of his originary model. The populate in the first case is not a problem and it is the idiomatic way to do it in mongoDb, but it is better to avoid to have `manufacturer.id.name`.

#### Difference between `id` and `_id`

- `id` is used in subdocuments such as the two case reported above. It is always created explicitly in the code and it always refers to an `_id` of a model.
- `_id` is created internally by mongoDb for each document. [structure](https://www.tutorialspoint.com/mongodb/mongodb_objectid.htm)

## AUTH

On login client send credentials to endpoint `/auth/login`.<br>
Passport use local strategy and if correct the client get Auth Token + Refresh Token.

- Auth Token is JWT with userID,
  - Payload with userID
  - Shot lifetime like 5 minute.
- Refresh token is UUID V1 (timestamp)
  - have long lifetime like 30 days
  - saved on DB in a table with its expiry data
  - sent to client as payload on other JWT with userID
  - one user can have more refresh token (different devices)

Any Route that need authorization need a middleware where Passport check JWT validate.<br>
The JWT is set as [cookie http-only](https://medium.com/@sadnub/simple-and-secure-api-authentication-for-spas-e46bcea592ad).<br>
If the Auth Token is not valid the response is `401 [Unauthorized, 401]`

```js
router.route('/').get(isAuth, controller.get);
```

The client can get new Auth Token with Refresh Token with endpoint `/auth/rt`<br>
The Refresh token is inside JWT payload as "rt" and set as [cookie http-only](https://medium.com/@sadnub/simple-and-secure-api-authentication-for-spas-e46bcea592ad).<br>
Passport check if JWT is validate and check if Refresh Token exist on DB for the userID

- If JWT is not valid the response is `401 [Unauthorized, 401]`
- If Refresh Token is expired the response is `401 [Expired refresh token, 310]`
- If Refresh Token does not exis the response is `401 [Refresh token does not exist, 306]` (maybe hack...)<br>
  In this case the client maybe hack: will remove all generetated refresh token for user and set authReset with current timestamp.<br>
  From now this user can't access, not even with valit auth token.<br>
  Will request to client to change the password

## RBAC

Any user can have `role` line "user" or "admin".
When user are logged, Passport load his grants from json file

```json
/* admin role */
{
	"users": { // resources
		"create:any": ["*"],
		"read:any": ["*"],
		"update:any": ["*"],
		"delete:any": ["*"]
	}
}

/* user role */
{
	"users": {
		"read:own": ["*"],
		"update:own": ["*","!active"] // cant change active field
	}
}
```

The permit file are Json Object where for each resources (like "users") can have CRUD grants with "any" or "own" and optionals attributes.

Any Route that need RACB need a middleware that validate.<br>
If the client can't have grants for the routes, the response is `403 [Forbidden, 403]`

```js
router.route('/').get(isAuth, rbac('users', 'read:any'), controller.get);
```

If you want to check "any" or "own" inside controllers

```js
// route.js
router.route('/:id').get(isAuth, rbac('users', 'read'), controller.getByID);

// controller.js
exports.getById = (req, res, next) => {
  if (res.locals.grants.type !== 'any' && res.locals.user.id !== req.params.id) return next(Forbidden());

  return User.findById(req.params.id, (err, user) => {
    // ...
  });
};
```

## dbFields Schema plugin

Plugin to define public and data fields that are filtered and manipulated before response.

```js
const dbFields = require('../helpers/dbFields');
const { Schema } = mongoose;

const schema = Schema({
	// schema
});
schema.plugin(dbFields, {
	public: ['_id', 'nickname', 'role', 'lang'],
	profile: ['pic', 'header'], // optional other fields with custom name
	urls: ['pic'],
	currencies: ['cost'],
	parseUrl:(key, item) => {
		switch (key) {
			case 'pic':
				return {
					full: `https://${process.env.AWS_S3_BUCKET_DATA}/images/projects/${item}`,
					thumb: `https://${process.env.AWS_S3_BUCKET_DATA}/images/projects/thumbs/${item}`
				};
			default:
				return item;
		}
	}
	...
});
```

All `find` queries without specific select automatically use `public` fields.

When you load all field for some reason, you can response with method `response`:

```js
User.findById(req.params.id, (err, user) => {
  if (err || !user) return next(NotFound());
  return next(SendData(user.response()));
});
```

If the method are called without parames the response return `public` fields.

Otherwise you can specificate your custom fields or array:

```js

	...
	return next(SendData(user.response('profile')));

	...
	return next(SendData(user.toJson(['_id','nickname'])));

```

Or you can specificate select fields on query

```js
User.findById(req.params.id, User.getFields('profile'), (err, user) => {
  if (err || !user) return next(NotFound());
  return next(SendData(user));
});
```

All fields ins `urls` will create a `${key}Url` field in the response according to the `parseUrl` function.

The fields in `currencies` will be converted if `exchangeRate` is passed to `.response()` or as option in query

```js
Project.findById(req.params.id, Project.getFields('public'), { exchangeRate: 1.16 }, callback);
```

OR

```js
const project = await Project.findById(req.params.id, Project.getFields('public'), callback);
return next(SendData(project.response('public', { exchangeRate: 1.16 })));
```

Do not use both, otherwise the conversion will be applied twice.

### Query Options

- `exchangeRate`: to convert currencies
- `internalGet`: if `true` all the middlewares will be skipped
- `skipParseUrls`: if `true` the `${key}Url` fields won't be created
- `skipConvertCurrencies`: if `true` the currencies won't be converted

## Mongoose History plugin

Plugin used to keep track of updates on a document, inspired by [mongoose-history-plugin](https://github.com/Masquerade-Circus/mongoose-history-plugin), modified to work with dbFields and updated to es6 + tests. [README](https://github.com/Masquerade-Circus/mongoose-history-plugin/blob/master/README.md)

```js
const mongooseHistory = require('../helpers/mongooseHistory');
const { Schema } = mongoose;

const schema = Schema({
	// schema
});

...

schema.plugin(
	mongooseHistory({
		mongoose,
		modelName: 'specs_h',
		userCollection: 'users',
		accountCollection: 'companies',
		userFieldName: 'user',
		accountFieldName: 'company'
	})
);
```

## Schema validation

The schema validation are saved like `js` in schema folder and loaded all when server startup.

```js
module.exports = {
  auth: {
    $id: 'auth',
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
      account: { type: 'string', pattern: '^[a-z1-5.]{1,12}$' }
    },
    additionalProperties: false,
    errorMessage: {
      //optional response error message for each properties
      properties: {
        email: '210',
        account: '211'
      }
    }
  },
  loginAuth: {
    type: 'object',
    allOf: [{ $ref: 'auth' }],
    required: ['email', 'password']
  },
  emailAuth: {
    type: 'object',
    allOf: [{ $ref: 'auth' }],
    required: ['email']
  },
  registerAuth: {
    type: 'object',
    allOf: [{ $ref: 'auth' }],
    required: ['email', 'password']
  }
};
```

To valid req.body with schema name use a middleware inside routes:

```js
router.post('/login', validator('loginAuth'), login);
```

To valid req.params or more pass an object to middleware:

- key = the source in express req
- value = schema name

```js
router.get('/email/:email?', validator({ params: 'emailAuth' }), checkIfEmailExists);
```
