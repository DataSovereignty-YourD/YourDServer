const mongoose = require('mongoose');

const UserAssetsSchema = new mongoose.Schema({
  User: {type: Array, require: true},
  Asset: {type: Array, require: true},
});

const UserAssetsModel = mongoose.model('UserAssetsModel', UserAssetsSchema)

module.exports = UserAssetsModel