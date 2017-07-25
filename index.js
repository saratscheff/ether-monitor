// index.js

// =============================================================================
// =============================================================================
// =================================BASE SETUP==================================
// =============================================================================
// =============================================================================

// Call the packages we need
var express       = require('express');           // call express
var app           = express();                    // define our app using express
var morgan        = require('morgan');            // used to log received requests
var fs            = require('fs');                // for file reading/writing
var public_path   = __dirname + '/public';        // public path

// To pass original headers through NGINX
app.set('trust proxy', 'loopback');

// use Morgan to log requests to the console
app.use(morgan('short')); // 'dev' for development / 'short' for production

var port = (process.env.ether_port) ? process.env.ether_port : 8081; // set our port

// ==================================Database===================================

var mongodb = require(__dirname + '/database/main.js');

// =================================Controllers=================================
var arbitrageCtrl = require(__dirname + '/controllers/arbitrageCtrl.js');
var ethermineCtrl = require(__dirname + '/controllers/ethermineCtrl.js');
var telegramCtrl  = require(__dirname + '/controllers/telegramCtrl.js');

var helpers       = require(__dirname + '/utilities/helpers.js');
require(__dirname + '/utilities/cron_jobs.js');

// =============================================================================
// =============================================================================
// ==================================ROUTES=====================================
// =============================================================================
// =============================================================================

// ==================================Middleware=================================
// app.use(function (req, res, next) {
//   // Nothing for now
//   next();
// });

// ================================Public Folder================================
app.use('/', express.static('public'));

// ===============================General Routes================================
var routes = require(__dirname + '/routes.js')
app.use('/', routes.router);

// =================================Catch 404s==================================
app.use('*',function(req,res){
  res.status(404);
  res.sendFile(public_path + '/404.html');
});

// =============================================================================
// =============================================================================
// ===============================START THE SERVER==============================
// =============================================================================
// =============================================================================

app.listen(port);
var currentDate = new Date();
currentDate.setTime(Date.now());
dateString = currentDate.toUTCString();
console.log(dateString + ' - Server running at port ' + port);
