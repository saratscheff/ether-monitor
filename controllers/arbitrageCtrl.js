// controllers/arbitrageCtrl.js
function eth_prices(callback) {
  // exchange[name, ASK, BID]
  var cryptomkt;
  var surbtc;
  var international_price;
  var usd_clp;

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

  valid_request('CRYPTOMKT', 'https://www.cryptomkt.com/api/ethclp/240.json', function (body) {
    cryptomkt_ask = body['data']['prices_ask']['values'][0]['close_price'];
    cryptomkt_bid = body['data']['prices_bid']['values'][0]['close_price'];
    cryptomkt = ['CRYPTOMKT', cryptomkt_ask, cryptomkt_bid];
    render_data();
  });

  valid_request('SURBTC', 'https://www.surbtc.com/api/v2/markets/ETH-CLP/ticker', function (body) {
    surbtc_ask = body['ticker']['min_ask'][0];
    surbtc_bid = body['ticker']['max_bid'][0];
    surbtc = ['SURBTC', surbtc_ask, surbtc_bid];
    render_data();
  });

  valid_request('ethereumprice', 'https://ethereumprice.org/wp-content/themes/theme/inc/exchanges/price-data.php?coin=eth&cur=ethusd&ex=waex', function (body) {
    international_price = body['current_price'];
    render_data();
  });

  valid_request('mindicador(CLP/USD)', 'http://mindicador.cl/api/dolar', function (body) {
    usd_clp = body['serie'][0]['valor'];
    render_data();
  });

  function render_data() {
    if (cryptomkt && surbtc && international_price && usd_clp) {
      callback(false, cryptomkt[1], cryptomkt[2], surbtc[1], surbtc[2], international_price, usd_clp);
    }
  }
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
    result_message = "Arbitrage: *" + calc + "* (Buy in CLP, sell in USD)";
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
