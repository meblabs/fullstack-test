const mongoose = require('mongoose');
const mongooseHistory = require('../helpers/mongooseHistory');
const db = require('../db/connect-test');

beforeAll(async () => await db.connect());
beforeEach(async () => await db.clear());
afterEach(async () => await jest.clearAllMocks());
afterAll(async () => await db.close());

const CompiledSchema = new mongoose.Schema({ name: 'string', size: 'string' });
CompiledSchema.plugin(mongooseHistory({ mongoose, modelName: 'tank_history' }));

test('should add the plugin to a schema', done => {
  // Create a new schema
  const Schema = new mongoose.Schema({ name: 'string', size: 'string' });
  // Initial schema must have no plugins
  expect(Schema.plugins).toEqual([]);

  // Add the mongoose history plguin
  Schema.plugin(mongooseHistory({ mongoose }));
  // Expect the plugin to be added to the schema
  expect(Schema.plugins).toEqual([
    expect.objectContaining({
      fn: expect.any(Function)
    })
  ]);
  return done();
});

test('should test methods added to the model', done => {
  const Tank = mongoose.model('tank', CompiledSchema);
  const small = new Tank({
    size: 'small'
  });

  expect(typeof small.getDiffs).toEqual('function');
  expect(typeof small.getVersions).toEqual('function');
  return done();
});

test('should create history when save', async () => {
  const Tank = mongoose.model('tank', CompiledSchema);
  const small = await new Tank({
    size: 'small'
  }).save();

  const diffs = await small.getDiffs();

  return expect(diffs).toStrictEqual([
    {
      _id: expect.any(Object),
      collectionName: 'tank',
      collectionId: small._id,
      diff: { size: { new: 'small' } },
      timestamp: expect.any(Date),
      ref: {},
      event: 'create'
    }
  ]);
});

test('should create history when save with event', async () => {
  const Tank = mongoose.model('tank', CompiledSchema);
  const small = await new Tank({
    size: 'small',
    __history: {
      event: 'create'
    }
  }).save();

  const diffs = await small.getDiffs();

  return expect(diffs).toStrictEqual([
    {
      _id: expect.any(Object),
      collectionName: 'tank',
      collectionId: small._id,
      diff: { size: { new: 'small' } },
      timestamp: expect.any(Date),
      event: 'create',
      ref: {}
    }
  ]);
});

test('should create history when save a change', async () => {
  const Tank = mongoose.model('tank', CompiledSchema);
  const small = await new Tank({
    size: 'small'
  }).save();

  small.size = 'medium';
  await small.save();
  small.size = 'large';
  await small.save();
  const diffs = await small.getDiffs();

  return expect(diffs).toEqual([
    {
      _id: expect.any(Object),
      collectionName: 'tank',
      collectionId: small._id,
      diff: { size: { new: 'large', old: 'medium' } },
      timestamp: expect.any(Date),
      ref: {},
      event: 'update'
    },
    {
      _id: expect.any(Object),
      collectionName: 'tank',
      collectionId: small._id,
      diff: { size: { new: 'medium', old: 'small' } },
      timestamp: expect.any(Date),
      ref: {},
      event: 'update'
    },
    {
      _id: expect.any(Object),
      collectionName: 'tank',
      collectionId: small._id,
      diff: { size: { new: 'small' } },
      timestamp: expect.any(Date),
      ref: {},
      event: 'create'
    }
  ]);
});

test('should get all versions', async () => {
  const Tank = mongoose.model('tank', CompiledSchema);
  const small = await new Tank({
    size: 'small'
  }).save();

  small.size = 'large';
  await small.save();
  const versions = await small.getVersions({ fields: ['size'] });
  return expect(versions).toEqual([
    {
      _id: expect.any(Object),
      collectionName: 'tank',
      collectionId: small._id,
      object: { size: 'small' },
      timestamp: expect.any(Date),
      ref: {},
      event: 'create'
    },
    {
      _id: expect.any(Object),
      collectionName: 'tank',
      collectionId: small._id,
      object: { size: 'large' },
      timestamp: expect.any(Date),
      ref: {},
      event: 'update'
    }
  ]);
});

test('should create history for sub documents', async () => {
  const parentSchema = mongoose.Schema({ tanks: [{ name_emb: 'string', size_emb: 'string' }] });
  parentSchema.plugin(mongooseHistory({ mongoose, modelName: 'EmbeddedCollection' }));
  const Parent = mongoose.model('parent', parentSchema);

  const tanks = await new Parent({ tanks: [{ size_emb: 'small' }] }).save();

  tanks.tanks[0].size_emb = 'large';
  await tanks.save();

  const diffs = await tanks.getDiffs();

  return expect(diffs).toEqual([
    {
      _id: expect.any(Object),
      collectionName: 'parent',
      collectionId: tanks._id,
      diff: {
        tanks: {
          old: [{ _id: expect.any(String), size_emb: 'small' }],
          new: [{ _id: expect.any(String), size_emb: 'large' }]
        }
      },
      ref: {},
      event: 'update',
      timestamp: expect.any(Date)
    },
    {
      _id: expect.any(Object),
      collectionName: 'parent',
      collectionId: tanks._id,
      diff: { tanks: { new: [{ _id: expect.any(String), size_emb: 'small' }] } },
      timestamp: expect.any(Date),
      ref: {},
      event: 'create'
    }
  ]);
});

test('Do not create history if the method is in ingoreMethods', async () => {
  const tmpSchema = mongoose.Schema({ name: String, size: String });
  tmpSchema.plugin(mongooseHistory({ mongoose, modelName: 'tmpSchema_history', ignoreMethods: ['ignore'] }));
  const Schema = mongoose.model('tmpSchema', tmpSchema);

  const small = await new Schema({
    size: 'small',
    __history: {
      event: 'create',
      method: 'create'
    }
  }).save();

  let diffs = await small.getDiffs();

  expect(diffs).toStrictEqual([
    {
      _id: expect.any(Object),
      collectionName: 'tmpSchema',
      collectionId: small._id,
      diff: { size: { new: 'small' } },
      timestamp: expect.any(Date),
      event: 'create',
      method: 'create',
      ref: {}
    }
  ]);

  small.size = 'large';
  small.__history = {
    method: 'ignore'
  };
  await small.save();

  diffs = await small.getDiffs();

  expect(diffs).toStrictEqual([
    {
      _id: expect.any(Object),
      collectionName: 'tmpSchema',
      collectionId: small._id,
      diff: { size: { new: 'small' } },
      timestamp: expect.any(Date),
      event: 'create',
      method: 'create',
      ref: {}
    }
  ]);
});
