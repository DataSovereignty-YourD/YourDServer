const mongoose = require('mongoose');

const UserAdsSchema = new mongoose.Schema({
  User: {type: Array, require: true},
  Title: { type: String, require: true },
  Description: { type: String, require: true },
  Category: { type: Array, require: true },
  DepositToken: { type: Number, require: true },
  RpP: { type: Number, require: true },
  Position: {type: Object, require: true},
  AdsCid: {type: Array, require: false},
});

const UserAdsModel = mongoose.model('UserModel', UserAdsSchema)

module.exports = UserAdsModel