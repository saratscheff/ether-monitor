// database/main.js

var fs            = require('fs');                // for file reading/writing

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

if (process.env.production_server) {
    // mongoose.connect('mongodb://username:password@host:port/database?options...');
    var uri = 'mongodb://' + process.env.mongo_username + ':' + process.env.mongo_password + '@localhost/ether';
    var mongoDB = mongoose.connect(uri, {
        useMongoClient: true
    });
} else {
    // mongoose.connect('mongodb://username:password@host:port/database?options...');
    var uri = 'mongodb://test:test@localhost/test';
    console.log("USING TEST ENVIRONMENT!!");
    var mongoDB = mongoose.connect(uri, {
        useMongoClient: true
    });
}

mongoDB.then(function (db) {
    console.log('mongodb has been connected');
}).catch(function (err) {
    console.log('error while trying to connect with mongodb: ' + err);
});

// Load models
fs.readdirSync(__dirname + '/models').forEach(function(filename) {
  if (~filename.indexOf('.js')) {
    require(__dirname + '/models/' + filename);
  }
});
var User = mongoose.model('User');
var Wallet = mongoose.model('Wallet');

module.exports = {
    User: User,
    Wallet: Wallet
};
