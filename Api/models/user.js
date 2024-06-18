const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const softDelete = require('../helpers/softDelete');
const dbFields = require('../helpers/dbFields');
const mongooseHistory = require('../helpers/mongooseHistory');

const { Schema } = mongoose;

const schema = Schema(
  {
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      trim: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      maxlength: 128,
      trim: true
    },
    lastname: {
      type: String,
      maxlength: 128,
      trim: true
    },
    fullname: {
      type: String,
      trim: true,
      index: true
    },
    phone: {
      country: { type: String, maxlength: 2, minlength: 2, uppercase: true, trim: true },
      prefix: { type: String, match: /^\+\d{1,4}$/, trim: true },
      number: { type: String, match: /^\d{6,11}$/, trim: true },
      formatted: { type: String }
    },
    lang: {
      type: String,
      maxlength: 2,
      minlength: 2,
      default: 'EN',
      required: true,
      uppercase: true
    },
    authReset: Date,
    active: {
      type: Boolean,
      default: false
    },
    company: {
      _id: false,
      id: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        index: true
      },
      name: {
        type: String,
        maxlength: 128,
        trim: true
      },
      type: { type: String },
      roles: [{ _id: false, type: String }]
    },
    roles: [{ _id: false, type: String }]
  },
  {
    timestamps: true
  }
);
schema.plugin(softDelete);
schema.plugin(dbFields, {
  fields: {
    public: ['_id', 'fullname', 'lang', 'company', 'createdAt'],
    listing: ['_id', 'name', 'lastname', 'fullname', 'email', 'active', 'createdAt'],
    profile: ['_id', 'fullname', 'name', 'lastname', 'lang', 'company', 'createdAt'],
    cp: ['_id', 'email', 'fullname', 'name', 'lastname', 'phone', 'lang', 'active', 'company', 'updatedAt', 'createdAt']
  }
});

schema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }

    if (this.isModified('name') || this.isModified('lastname') || (this.isNew && !this.fullname))
      this.fullname = `${this.name || ''} ${this.lastname || ''}`;

    if (this.isModified('phone.prefix') || this.isModified('phone.number')) {
      if (!this.phone.prefix && !this.phone.number) {
        this.phone = undefined;
      } else {
        this.phone.formatted = `${this.phone.prefix || ''}${this.phone.number || ''}`;
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
});

schema.methods.comparePassword = function (pwd, callback) {
  bcrypt.compare(pwd, this.password, (err, isMatch) => {
    if (err) return callback(err);
    return callback(null, isMatch);
  });
};

schema.plugin(
  mongooseHistory({
    mongoose,
    modelName: 'users_h',
    userCollection: 'User',
    accountCollection: 'Company',
    userFieldName: 'user',
    accountFieldName: 'company',
    noDiffSaveOnMethods: []
  })
);

module.exports = mongoose.models.User || mongoose.model('User', schema);
