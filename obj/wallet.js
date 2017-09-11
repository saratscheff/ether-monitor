// obj/wallet.js
const ETHERSCAN_API_KEY = process.env.etherscan_api_key; // https://etherscan.io/myapikey

// API Documentation => https://etherscan.io/apis

// Class instantiation
var wa = Wallet.prototype;

// Constructor
function Wallet(name, dir) {
    this.name = name;
    this.dir = dir;
}

// Methods
var request = require('request');

wa.getBalance = function(callback) {
  var url = 'https://api.etherscan.io/api?module=account&action=balance&address=' + this.dir + '&tag=latest&apikey=' + ETHERSCAN_API_KEY;
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      callback((parseFloat(body['result'])/1000000000000000000).toFixed(18));
    } else if (error){
      callback("ERROR on GetBalance: " + error);
    } else {
      callback("ERROR on GetBalance: Status code => " + response.statusCode);
    }
  });
};

module.exports = Wallet;
