// controllers/ethermineCtrl.js

function miner_status_telegram(address, callback) {
  var request = require('request');

  request('https://api.ethermine.org/miner/' + address + '/workers', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      var workers = body['data'];
      request('https://api.ethermine.org/miner/' + address + '/currentStats', function (error, response, body2) {
        if (!error && response.statusCode == 200) {
          body2 = JSON.parse(body2);
          var stats = body2['data'];

          var answer = '*Miners Status*';
          var workers_count = 0;
          for (var worker in workers){
            workers_count += 1;
            answer += "\n--- " + workers[worker]['worker'] + "---";
            answer += "\nReported hashrate: " + (workers[worker]['reportedHashrate']/1000000).toFixed(2) + 'MH/s';
            answer += "\nValid shares: " + workers[worker]['validShares'];
            answer += "\nCurrent hashrate: " + (workers[worker]['currentHashrate']/1000000).toFixed(2) + 'MH/s';
          }
          eth_to_weis = 1000000000000000000; // 1 Ether in Weis
          answer += "\n*Payments*";
          answer += "\nUnpaid amount: " + (stats['unpaid']/eth_to_weis);
          answer += "\nDays until paid 1ETH: " + ((1-(stats['unpaid']/eth_to_weis))/(24*60*stats['coinsPerMin']));
          answer += "\n*Earnings per*";
          answer += "\nDay: " + (24*60*stats['coinsPerMin']);
          answer += "\nWeek: " + (7*24*60*stats['coinsPerMin']);
          answer += "\nMonth: " + (30*24*60*stats['coinsPerMin']);
          callback(false, answer, workers_count);
        } else if (error){
          callback(error, null, null);
        } else {
          callback('ERROR: Status code: ' + response.statusCode, null, null);
        }
      });
    } else if (error){
      callback(error, null, null);
    } else {
      callback('ERROR: Status code: ' + response.statusCode, null, null);
    }
  });
}

function check_miner_ok(user, callback) {
  var request = require('request');
  var address = user.miner_address;

  request('https://api.ethermine.org/miner/' + address + '/workers', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      var workers = body['data'];

      var answer = '*WARNING!!*';
      var hashing_0 = false;
      var workers_count = 0;
      for (var worker in workers){
        workers_count += 1;
        if (workers[worker]['reportedHashrate'] == 0) {
          answer += "\n" + workers[worker]['worker'] + " is reporting 0H/s";
          hashing_0 = true;
        };
      }
      callback(false, answer, workers_count, hashing_0, user);
    } else if (error){
      callback(error, null, null, null, user);
    } else {
      callback('ERROR: Status code: ' + response.statusCode, null, null, null, user);
    }
  });
}

module.exports = {
    miner_status_telegram: miner_status_telegram,
    check_miner_ok: check_miner_ok
};
