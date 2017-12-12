// controllers/arbitrageCtrl.js
var Exchange = require("../obj/exchange.js");
var Arbitrage = require("../obj/arbitrage.js");

function valid_request(name, url, count, process_callback) {
  var request = require('request');

  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log('success: ' + name);
      body = JSON.parse(body);
      process_callback(body, false);
    } else {
      if (count <= 1) {
        if (response) { console.log('retrying ' + name + response.statusCode); }
        setTimeout(function() { valid_request(name, url, count + 1, process_callback); }, 5000);
      } else {
        if (response) {
          console.log('ERROR ' + name + response.statusCode)
          process_callback(response.statusCode, true);
        } else {
          console.log('ERROR ' + name + error);
          process_callback(error, true);
        }
      }
    }
  });
}

function eth_prices(callback) {
  var usd_clp;
  var international_price;
  var exchanges = [null, null, null, null];

  // ----------- USD/CLP
  valid_request('mindicador.cl', 'http://mindicador.cl/api/dolar', 0, function(body, error) {
    if (error) {
      usd_clp = false;
    } else {
      usd_clp = parseFloat(body['serie'][0]['valor']);
    }
    process_data();
  });

  // ----------- Ether international price
  valid_request('ethereumprice.org', 'https://v2.ethereumprice.org:8080/snapshot/eth/usd/waex/1h', 0, function(body, error) {
    if (error) {
      international_price = false;
    } else {
      international_price = parseFloat(body['data']['price']);
    }
    process_data();
  });

  // ----------- EXCHANGES
  valid_request('cryptomkt.com', 'https://www.cryptomkt.com/api/ethclp/240.json', 0, function(body, error) {
    if (error) {
      exchanges[0] = new Exchange('CRYPTOMKT', false, false, false);
    } else {
      var cryptomkt_ask = parseFloat(body['data']['prices_ask']['values'][0]['close_price']);
      var cryptomkt_bid = parseFloat(body['data']['prices_bid']['values'][0]['close_price']);
      exchanges[0] = new Exchange('CRYPTOMKT', cryptomkt_ask, cryptomkt_bid, 'CLP');
    }
    process_data();
  });

  valid_request('surbtc.com', 'https://www.surbtc.com/api/v2/markets/ETH-CLP/ticker', 0, function(body, error) {
    if (error) {
      exchanges[1] = new Exchange('SURBTC', false, false, false);
    } else {
      var surbtc_ask = parseFloat(body['ticker']['min_ask'][0]);
      var surbtc_bid = parseFloat(body['ticker']['max_bid'][0]);
      exchanges[1] = new Exchange('SURBTC', surbtc_ask, surbtc_bid, 'CLP');
    }
    process_data();
  });

  valid_request('kraken.com', 'https://api.kraken.com/0/public/Ticker?pair=ETHUSD', 0, function(body, error) {
    if (error) {
      exchanges[2] = new Exchange('KRAKEN', false, false, false);
    } else {
      var kraken_ask = parseFloat(body['result']['XETHZUSD']['a'][0]);
      var kraken_bid = parseFloat(body['result']['XETHZUSD']['b'][0]);
      exchanges[2] = new Exchange('KRAKEN', kraken_ask, kraken_bid, 'USD');
    }
    process_data();
  });

  valid_request('lykke.com', 'https://public-api.lykke.com/api/AssetPairs/rate', 0, function(body, error) {
    if (error) {
      exchanges[3] = new Exchange('LYKKE', false, false, false);
    } else {
      body.some(function(pair) {
        if (pair['id'] === 'ETHUSD') {
          var lykke_ask = parseFloat(pair['ask']);
          var lykke_bid = parseFloat(pair['bid']);
          exchanges[3] = new Exchange('LYKKE', lykke_ask, lykke_bid, 'USD');
          return true;
        }
      });
    }
    process_data();
  });

  // ----------- send data when all returned
  function process_data() {
    if (usd_clp != null && international_price != null && !exchanges.includes(null)) {
      callback(false, usd_clp, international_price, exchanges);
    }
  }
}

function btc_prices(callback) {
  var usd_clp;
  var international_price;
  var exchanges = [null, null, null, null];

  // ----------- USD/CLP
  valid_request('mindicador.cl', 'http://mindicador.cl/api/dolar', 0, function(body, error) {
    if (error) {
      usd_clp = false;
    } else {
      usd_clp = parseFloat(body['serie'][0]['valor']);
    }
    process_data();
  });

  // ----------- BTC international price
  valid_request('coindesk.com', 'https://api.coindesk.com/v1/bpi/currentprice.json', 0, function(body, error) {
    if (error) {
      international_price = false;
    } else {
      international_price = parseFloat(body['bpi']['USD']['rate_float']);
    }
    process_data();
  });

  // ----------- EXCHANGES
  valid_request('surbtc.com', 'https://www.surbtc.com/api/v2/markets/BTC-CLP/ticker', 0, function(body, error) {
    if (error) {
      exchanges[1] = new Exchange('SURBTC', false, false, false);
    } else {
      var surbtc_ask = parseFloat(body['ticker']['min_ask'][0]);
      var surbtc_bid = parseFloat(body['ticker']['max_bid'][0]);
      exchanges[1] = new Exchange('SURBTC', surbtc_ask, surbtc_bid, 'CLP');
    }
    process_data();
  });

  valid_request('kraken.com', 'https://api.kraken.com/0/public/Ticker?pair=XBTUSD', 0, function(body, error) {
    if (error) {
      exchanges[1] = new Exchange('KRAKEN', false, false, false);
    } else {
      var kraken_ask = parseFloat(body['result']['XXBTZUSD']['a'][0]);
      var kraken_bid = parseFloat(body['result']['XXBTZUSD']['b'][0]);
      exchanges[1] = new Exchange('KRAKEN', kraken_ask, kraken_bid, 'USD');
    }
    process_data();
  });

  valid_request('lykke.com', 'https://public-api.lykke.com/api/AssetPairs/rate', 0, function(body, error) {
    if (error) {
      exchanges[2] = new Exchange('LYKKE', false, false, false);
    } else {
      body.some(function(pair) {
        if (pair['id'] === 'BTCUSD') {
          var lykke_ask = parseFloat(pair['ask']);
          var lykke_bid = parseFloat(pair['bid']);
          exchanges[2] = new Exchange('LYKKE', lykke_ask, lykke_bid, 'USD');
          return true;
        }
      });
    }
    process_data();
  });

  // ----------- send data when all returned
  function process_data() {
    if (usd_clp != null && international_price != null && !exchanges.includes(null)) {
      callback(false, usd_clp, international_price, exchanges);
    }
  }
}

function eth_price(callback) {
  // ----------- Ether international price
  valid_request('ethereumprice.org', 'https://v2.ethereumprice.org:8080/snapshot/eth/usd/waex/1h', 0, function(body, error) {
    callback(false, parseFloat(body['data']['price']));
  });
}

function btc_price(callback) {
  // ----------- BTC international price
  valid_request('coindesk.com', 'https://api.coindesk.com/v1/bpi/currentprice.json', 0, function(body, error) {
    callback(false, parseFloat(body['bpi']['USD']['rate_float']));
  });
}

function arbitrage_calc(exchanges, usd_clp) {
  // TODO: Add market fees
  var result = [];
  exchanges.forEach(function(exchange1) {
    if (exchange1.ask == false) {
      return;
    }
    if (exchange1.boring_currency === 'USD') {
      ex1 = exchange1.ask * usd_clp;
    } else {
      ex1 = exchange1.ask;
    }
    exchanges.forEach(function(exchange2) {
      if (exchange2.ask == false) {
        return;
      }
      if (exchange2.boring_currency === 'USD') {
        ex2 = exchange2.bid * usd_clp;
      } else {
        ex2 = exchange2.bid;
      }
      if ((calc = ex2 - ex1) > 0 && ex1 > 0 && ex2 > 0){
        result.push(new Arbitrage(calc, exchange1, exchange2));
      }
    });
  });
  return result;
}

function arbitrage_calc_message(exchanges, usd_clp) {
  var result = arbitrage_calc(exchanges, usd_clp);
  result_message = "*ARBITRAGE OPPORTUNITIES* (Buy -> Sell)";
  if (result.length <= 0) {
    result_message += "\nNone...";
  } else {
    result.forEach(function(arbitrage_opportunity) {
      result_message += "\nCLP$*"
                        + parseFloat(arbitrage_opportunity.amount).toFixed(1)
                        + "* (" + arbitrage_opportunity.origin.name
                        + " *->* " + arbitrage_opportunity.destination.name
                        + ")";
    });
  }
  return result_message;
}

module.exports = {
  eth_prices: eth_prices,
  btc_prices: btc_prices,
  eth_price: eth_price,
  btc_price: btc_price,
  arbitrage_calc: arbitrage_calc,
  arbitrage_calc_message: arbitrage_calc_message
};
