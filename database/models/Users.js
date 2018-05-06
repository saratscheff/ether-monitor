// database/models/Users.js

var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  _id: {
    type     : Number,
    required : true,
    unique   : true,
    validate : {
      validator : Number.isInteger,
      message   : '{VALUE} is not an integer value'
    }
  },
  n_workers: Number,
  arbitrage_minimum_alert: Number,
  cryptomkt: Boolean,
  buda: Boolean,
  kraken: Boolean,
  lykke: Boolean,
  waiting_for_command: String,
  miner_address: String,
  last_eth_price: Number,
  last_btc_price: Number,
  eth_change_limit: Number,
  btc_change_limit: Number
});

// userSchema.methods.message = function(markdown_text) {
//   Send telegram message?
// }

var User = mongoose.model('User', userSchema);
//var user_sample = new Users({ id: 158556890 });

module.exports = {
  User: User
};
