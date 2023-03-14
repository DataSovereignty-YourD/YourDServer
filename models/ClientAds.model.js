const mongoose = require('mongoose');

const ClientAdsListSchema = new mongoose.Schema({
  AdsCid: {type: String, require: true},
  Watched: { type: Boolean, require: true },
    User: {type: Array, require: true}
});

const ClientAdsListModel = mongoose.model('ClientAdsModel', ClientAdsListSchema)

module.exports = ClientAdsListModel