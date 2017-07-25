// controllers/cronCtrl.js

var cron          = require('node-cron');         // Cron
var fs            = require('fs');                // for file reading/writing
var public_path   = __dirname + '/../public';        // public path
var telegramCtrl  = require(__dirname + '/../controllers/telegramCtrl.js');
var arbitrageCtrl = require(__dirname + '/../controllers/arbitrageCtrl.js');
var ethermineCtrl = require(__dirname + '/../controllers/ethermineCtrl.js');
var helpers       = require(__dirname + '/helpers.js');

// =============================================================================
// =============================================================================
// =================================ARBITRAGE===================================
// =============================================================================
// =============================================================================

cron.schedule('*/2 * * * *', function(){
  function check_arbitrage(error, crypto_ask, crypto_bid, surbtc_ask, surbtc_bid, int_price, usd_clp){
    var file_crypto = public_path + '/crypto_arbitrage.txt';
    var file_surbtc = public_path + '/surbtc_arbitrage.txt';
    var datetime = '[' + (new Date()).toLocaleString() + '] ';
    if (error){
      console.log('error while cron calculating arbitrage: ' + error);
    } else {
      var crypto_arbitrage_arr = arbitrageCtrl.arbitrage_calc(crypto_ask, crypto_bid, usd_clp, int_price);
      var text = datetime + " // " + crypto_arbitrage_arr[0] +" // " + crypto_arbitrage_arr[1] + '\n';
      fs.appendFile(file_crypto, text, function (err) {
          if (err) return console.log(err);
      });
      var surbtc_arbitrage_arr = arbitrageCtrl.arbitrage_calc(surbtc_ask, surbtc_bid, usd_clp, int_price);
      var text = datetime + " // " + surbtc_arbitrage_arr[0] +" // " + surbtc_arbitrage_arr[1] + '\n';
      fs.appendFile(file_surbtc, text, function (err) {
          if (err) return console.log(err);
      });

      //========================= TELEGRAM ALERT ==============================
      telegramCtrl.arbitrage_alerts(crypto_arbitrage_arr[1], arbitrageCtrl.arbitrage_calc_message(crypto_ask, crypto_bid, usd_clp, int_price) + " at CryptoMkt\n");
      telegramCtrl.arbitrage_alerts(surbtc_arbitrage_arr[1], arbitrageCtrl.arbitrage_calc_message(surbtc_ask, surbtc_bid, usd_clp, int_price) + " at SURBTC\n");
    }
  }
  arbitrageCtrl.eth_prices(check_arbitrage);
});

// =============================================================================
// =============================================================================
// =================================MINER OK?===================================
// =============================================================================
// =============================================================================

cron.schedule('*/2 * * * *', function(){
  function check_miner(error, answer, workers_count, hashing_0, user){
    if (error) {
      telegramCtrl.telegram.sendMessage(user._id, "ERROR on MinerOK?: " + error);
    } else {
      if (workers_count != user.n_workers) {
        telegramCtrl.telegram.sendMessage(user._id, "*WARNING!*\nNumber of workers changed from " + user.n_workers + " to " + workers_count, {
          parse_mode: "Markdown"
        });
        user.n_workers = workers_count;
        user.save();
      }
      if (hashing_0) {
        telegramCtrl.telegram.sendMessage(user._id, answer, {
          parse_mode: "Markdown"
        });
      }
    }
  }
  helpers.iterate_users(function(user) {
    if (user.miner_address) {
      ethermineCtrl.check_miner_ok(user, check_miner);
    }
  });
});
