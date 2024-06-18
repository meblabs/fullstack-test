const mongoose = require('mongoose');
const softDelete = require('../helpers/softDelete');
const dbFields = require('../helpers/dbFields');
const mongooseHistory = require('../helpers/mongooseHistory');

const { AWS_S3_BUCKET_DATA } = process.env;
const { Schema } = mongoose;

const schema = Schema(
  {
    name: {
      type: String,
      maxlength: 128,
      trim: true
    },
    lang: {
      type: String,
      maxlength: 2,
      minlength: 2,
      default: 'EN',
      required: true,
      uppercase: true
    },
    pic: {
      type: String,
      trim: true
    },
    zipcode: {
      type: String,
      lowercase: true,
      trim: true
    },
    country: {
      type: String,
      maxlength: 2,
      minlength: 2,
      uppercase: true
    },
    city: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    phone: {
      country: { type: String, maxlength: 2, minlength: 2, uppercase: true, trim: true },
      prefix: { type: String, match: /^\+\d{1,4}$/, trim: true },
      number: { type: String, match: /^\d{6,11}$/, trim: true },
      formatted: { type: String }
    },
    vatNumber: {
      type: String,
      uppercase: true,
      trim: true
    },
    type: { type: String, index: true }
  },
  {
    timestamps: true
  }
);
schema.plugin(softDelete);
schema.plugin(dbFields, {
  fields: {
    public: ['_id', 'name', 'pic', 'lang', 'createdAt'],
    listing: ['_id', 'name', 'pic', 'type', 'createdAt'],
    cp: [
      '_id',
      'name',
      'pic',
      'lang',
      'zipcode',
      'country',
      'city',
      'address',
      'phone',
      'vatNumber',
      'type',
      'updatedAt',
      'createdAt'
    ]
  },
  urls: ['pic'],
  parseUrl: (name, value) => {
    switch (name) {
      case 'pic':
        return `https://${AWS_S3_BUCKET_DATA}/images/companies/${value}`;
      default:
        return name;
    }
  }
});

schema.plugin(
  mongooseHistory({
    mongoose,
    modelName: 'companies_h',
    userCollection: 'User',
    accountCollection: 'Company',
    userFieldName: 'user',
    accountFieldName: 'company',
    noDiffSaveOnMethods: []
  })
);

schema.pre('save', function (next) {
  try {
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

schema.post('save', doc =>
  mongoose.models.User.updateMany(
    { 'company.id': doc._id, 'company.name': { $ne: doc.name } },
    { 'company.name': doc.name }
  )
);

module.exports = mongoose.models.Company || mongoose.model('Company', schema);
