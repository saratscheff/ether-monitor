// controllers/arbitrageCtrl.js

function eth_prices(callback) {
  var request = require('request');
  var cryptomkt_ask;
  var cryptomkt_bid;
  var international_price;

  request('https://www.cryptomkt.com/api/ethclp/240.json', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      // TODO: Price considering 1ETH offered in total
      cryptomkt_ask = body['data']['prices_ask']['values'][0]['close_price'];
      cryptomkt_bid = body['data']['prices_bid']['values'][0]['close_price'];

      request('https://www.surbtc.com/api/v2/markets/ETH-CLP/ticker', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          body = JSON.parse(body);
          // TODO: Price considering 1ETH offered in total
          surbtc_ask = body['ticker']['min_ask'][0];
          surbtc_bid = body['ticker']['max_bid'][0];

          request('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=ETH,USD', function (error, response, body) {
            if (!error && response.statusCode == 200) {
              body = JSON.parse(body);
              // TODO: Price in LYKKE market
              international_price = body['USD'];

              request('http://mindicador.cl/api/dolar', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                  body = JSON.parse(body);
                  // TODO: Price in BancoChile
                  usd_clp = body['serie'][0]['valor'];

                  callback(false, cryptomkt_ask, cryptomkt_bid, surbtc_ask, surbtc_bid, international_price, usd_clp);


                } else if (error){
                  callback(error, null, null, null, null);
                } else {
                  callback('ERROR: Status code: ' + response.statusCode, null, null, null, null, null, null);
                }
              });
            } else if (error){
              callback(error, null, null, null, null);
            } else {
              callback('ERROR: Status code: ' + response.statusCode, null, null, null, null, null, null);
            }
          });
        } else if (error){
          callback(error, null, null, null, null);
        } else {
          callback('ERROR: Status code: ' + response.statusCode, null, null, null, null, null, null);
        }
      });
    } else if (error){
      callback(error, null, null, null, null);
    } else {
      callback('ERROR: Status code: ' + response.statusCode, null, null, null, null, null, null);
    }
  });
}

function arbitrage_calc(ask, bid, usd_clp, int_price) {
  var calc = 0;
  var result = [0,0];
  if ((calc = bid - usd_clp*int_price) > 0) {
    result[0] = 1;
    result[1] = calc;
  } else if ((calc = usd_clp*int_price - ask) > 0) {
    result[0] = 2;
    result[1] = calc;
  }
  return result;
}

function arbitrage_calc_message(ask, bid, usd_clp, int_price) {
  var calc = 0;
  if ((calc = bid - usd_clp*int_price) > 0) {
    result_message = "Arbitrage: *" + calc + "* (Buy in USD, sell in CLP)";
  } else if ((calc = usd_clp*int_price - ask) > 0) {
    result_message = "Arbitrage: *" + calc + "* (Buy in USD, sell in CLP)";
  } else {
    result_message = "Arbitrage: *" + 0 + "* (No arbitrage opportunity)";
  }
  return result_message;
}

module.exports = {
    eth_prices: eth_prices,
    arbitrage_calc: arbitrage_calc,
    arbitrage_calc_message: arbitrage_calc_message
};
