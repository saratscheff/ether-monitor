// database/models/Wallets.js

var mongoose = require('mongoose');

var walletSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  address: String,
  name: String
});

var Wallet = mongoose.model('Wallet', walletSchema);
//var wallet_sample = new Wallet({ userId: 158556890, address: 123, name: 'asd' });

module.exports = {
    Wallet: Wallet
};
