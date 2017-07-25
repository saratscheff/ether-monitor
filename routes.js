// routes.js

var express  = require('express');  // call express
var router   = express.Router();    // get an instance of the express Router

// ==================================CryptoMkt==================================

router.get('/', function(req, res){
  res.sendFile(__dirname + '/views/ether.html');
});

// Obsolete route for pending API
// router.get('/ether_arbitrage', function(req, res){
//   function show_arbitrage(error, crypto_ask, crypto_bid, surbtc_ask, surbtc_bid, int_price, usd_clp){
//     if (error) {
//       res.status(500);
//       res.setHeader('Content-Type', 'application/json');
//       res.send(JSON.stringify({ error: error }));
//     }
//     res.setHeader('Content-Type', 'application/json');
//     res.send(JSON.stringify({ arbitrage: crypto_bid - usd_clp*int_price, crypto_ask: crypto_ask, crypto_bid: crypto_bid, int_price: int_price, int_clp_price: usd_clp*int_price, usd_clp: usd_clp }));
//   }
//   arbitrageCtrl.eth_prices(show_arbitrage);
// });

module.exports = {
  router: router
}
