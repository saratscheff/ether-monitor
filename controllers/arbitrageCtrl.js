// controllers/arbitrageCtrl.js
function eth_prices(callback) {
  var usd_clp;
  var international_price;
  // exchange => [name, ASK, BID, 'USD'/'CLP']
  var exchanges = [null, null, null, null];

  var got_error = false;

  function valid_request(name, url, process_callback) {
    var request = require('request');

    request(url, function (error, response, body) {
      if (got_error) {
        // Stop...
      } else if (!error && response.statusCode == 200) {
        body = JSON.parse(body);
        process_callback(body);
      } else if (error){
        got_error = true;
        callback('ERROR requesting to ' + name + '. Error_message =>' + error, null, null, null, null, null, null);
      } else {
        got_error = true;
        callback('ERROR requesting to ' + name + '. Status code => ' + response.statusCode, null, null, null, null, null, null);
      }
    });
  }

  // ----------- USD/CLP
  valid_request('mindicador.cl', 'http://mindicador.cl/api/dolar', function (body) {
    usd_clp = parseFloat(body['serie'][0]['valor']);
    render_data();
  });

  // ----------- Ether international price
  valid_request('ethereumprice.org', 'https://ethereumprice.org/wp-content/themes/theme/inc/exchanges/price-data.php?coin=eth&cur=ethusd&ex=waex', function (body) {
    international_price = parseFloat(body['current_price']);
    render_data();
  });

  // ----------- EXCHANGES
  valid_request('cryptomkt.com', 'https://www.cryptomkt.com/api/ethclp/240.json', function (body) {
    cryptomkt_ask = parseFloat(body['data']['prices_ask']['values'][0]['close_price']);
    cryptomkt_bid = parseFloat(body['data']['prices_bid']['values'][0]['close_price']);
    exchanges[0] = ['CRYPTOMKT', cryptomkt_ask, cryptomkt_bid, 'CLP'];
    render_data();
  });

  valid_request('surbtc.com', 'https://www.surbtc.com/api/v2/markets/ETH-CLP/ticker', function (body) {
    surbtc_ask = parseFloat(body['ticker']['min_ask'][0]);
    surbtc_bid = parseFloat(body['ticker']['max_bid'][0]);
    exchanges[1] = ['SURBTC', surbtc_ask, surbtc_bid, 'CLP'];
    render_data();
  });

  valid_request('kraken.com', 'https://api.kraken.com/0/public/Ticker?pair=ETHUSD', function (body) {
    kraken_ask = parseFloat(body['result']['XETHZUSD']['a'][0]);
    kraken_bid = parseFloat(body['result']['XETHZUSD']['b'][0]);
    exchanges[2] = ['KRAKEN', kraken_ask, kraken_bid, 'USD'];
    render_data();
  });

  valid_request('lykke.com', 'https://public-api.lykke.com/api/AssetPairs/rate', function (body) {
    body.some(function(pair) {
      if (pair['id'] === 'ETHUSD') {
        lykke_ask = parseFloat(pair['ask']);
        lykke_bid = parseFloat(pair['bid']);
        exchanges[3] = ['LYKKE', lykke_ask, lykke_bid, 'USD'];
        return true;
      }
    });
    render_data();
  });

  // ----------- send data when all returned
  function render_data() {
    if (usd_clp && international_price && !exchanges.includes(null)) {
      callback(false, usd_clp, international_price, exchanges);
    }
  }
}

function arbitrage_calc(exchanges, usd_clp) {
  var result = [];
  // exchange => [name, ask, bid, USD/CLP]
  exchanges.forEach(function(exchange1) {
    if (exchange1[3] === 'USD') {
      ex1 = exchange1[1] * usd_clp;
    } else {
      ex1 = exchange1[1];
    }
    exchanges.forEach(function(exchange2) {
      if (exchange2[3] === 'USD') {
        ex2 = exchange2[2] * usd_clp;
      } else {
        ex2 = exchange2[2];
      }
      if ((calc = ex2 - ex1) > 0){
        result.push([calc, exchange1[0] + ' *->* ' + exchange2[0]])
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
      result_message += "\nCLP$*" + parseFloat(arbitrage_opportunity[0]).toFixed(1) + "* (" + arbitrage_opportunity[1] + ")";
    });
  }
  return result_message;
}

module.exports = {
    eth_prices: eth_prices,
    arbitrage_calc: arbitrage_calc,
    arbitrage_calc_message: arbitrage_calc_message
};
