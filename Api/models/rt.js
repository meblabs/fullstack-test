const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = Schema(
  {
    token: String,
    expires: { type: Date, expires: 0 },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Rt || mongoose.model('Rt', schema);
