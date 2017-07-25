// controllers/ethermineCtrl.js

function miner_status_telegram(address, callback) {
  var request = require('request');

  request('https://ethermine.org/api/miner_new/' + address, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      var workers = body['workers'];

      var answer = '*Miners Status*';
      var workers_count = 0;
      for (var worker in workers){
        workers_count += 1;
        if (workers.hasOwnProperty(worker)){
          answer += "\n--- " + worker + "---";
          answer += "\nReported hashrate: " + body['workers'][worker]['reportedHashRate'];
          answer += "\nValid shares: " + body['workers'][worker]['validShares'];
          answer += "\nCurrent hashrate: " + body['workers'][worker]['hashrate'];
        }
      }
      answer += "\n*Payments*";
      answer += "\nUnpaid amount: " + (body['unpaid']/body['settings']['minPayout']);
      answer += "\nDays until paid 1ETH: " + ((1-(body['unpaid']/body['settings']['minPayout']))/(24*60*body['ethPerMin']));
      answer += "\n*Earnings per*";
      answer += "\nDay: " + (24*60*body['ethPerMin']);
      answer += "\nWeek: " + (7*24*60*body['ethPerMin']);
      answer += "\nMonth: " + (30*24*60*body['ethPerMin']);
      callback(false, answer, workers_count);
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

  request('https://ethermine.org/api/miner_new/' + address, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      var workers = body['workers'];

      var answer = '*WARNING!!*';
      var hashing_0 = false;
      var workers_count = 0;
      for (var worker in workers){
        workers_count += 1;
        if (workers.hasOwnProperty(worker)){
          if (body['workers'][worker]['reportedHashRate'] == "0H/s") {
            answer += "\n" + worker + " is reporting 0H/s";
            hashing_0 = true;
          };
        }
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
