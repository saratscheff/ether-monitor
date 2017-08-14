// controllers/telegram.js

var helpers     = require(__dirname + '/../utilities/helpers.js');
var mongodb     = require(__dirname + '/../database/main.js');
var arbitrageCtrl = require(__dirname + '/arbitrageCtrl.js');
var ethermineCtrl = require(__dirname + '/ethermineCtrl.js');

// Telegram -> Saratscheff @saratscheff_bot or Saratscheff_test @saratscheff_test_bot
var api_key = (process.env.telegram_api_key) ? process.env.telegram_api_key : "426930228:AAEBFn5du3saN4g65Kt0Vex9qvhaRoYeOt4";
var TelegramBot = require('node-telegram-bot-api'),
    telegram = new TelegramBot(api_key, { polling: true });

function arbitrage_alerts(value, answer) {
  helpers.iterate_users(function(user) {
    if (user.arbitrage_minimum_alert && (user.arbitrage_minimum_alert < value || value < -user.arbitrage_minimum_alert)) {
      telegram.sendMessage(user._id, answer, {
        parse_mode: "Markdown"
      });
    }
  });
}

function process_message(user, message) {
  if (user == null) {
    console.log("ERROR!! Null user!");
    return;
  }
  if (user.waiting_for_command == "set_arbitrage_minimum"){
    var new_limit = parseInt(message.text);
    if (new_limit) {
      user.arbitrage_minimum_alert = new_limit;
      user.waiting_for_command = undefined;
      user.save();
      telegram.sendMessage(message.chat.id, "Success! New minimum arbitrage limit for alerts: " + new_limit);
    } else if (new_limit === 0){
      user.arbitrage_minimum_alert = undefined;
      user.waiting_for_command = undefined;
      user.save();
      telegram.sendMessage(message.chat.id, "Success! Alerts are now disabled.");
    } else {
      telegram.sendMessage(message.chat.id, "INVALID FORMAT, please try again, what would you like to be the new minimum limit to be alerted for arbitrage? (PLAIN NUMBER ONLY!)");
    }
  } else if (user.waiting_for_command == "register_miner_address"){
    if (message.text.toLowerCase().indexOf("none") === 0) {
      user.miner_address = undefined;
      user.waiting_for_command = undefined;
      user.save();
      telegram.sendMessage(message.chat.id, "Success! Your miner address was succesfully removed from the database");
    } else {
      user.miner_address = message.text;
      user.waiting_for_command = undefined;
      user.save();
      telegram.sendMessage(message.chat.id, "Success! Your miner address was succesfully registered: " + message.text);
    }
  } else {

    // ================================Ether Status=============================
    if(message.text.toLowerCase().indexOf("/ether") === 0) {
      var tries = 3;
      function show_arbitrage(error, usd_clp, int_price, exchanges){
        if (error && tries > 0) {
          tries--;
          telegram.sendMessage(message.chat.id, "Too many requests, retrying in 10 seconds...");
          setTimeout(function() { arbitrageCtrl.eth_prices(show_arbitrage) }, 10000);
          return;
        } else if (error) {
          telegram.sendMessage(message.chat.id, "ERROR on EtherStatus: " + error);
          return;
        }
        var answer = "";
        answer += "*INTERNATIONAL*\n";
        answer += "Ether Price in USD: " + int_price.toFixed(2) + "\n";
        answer += "USD Price in CLP: " + usd_clp.toFixed(2) + "\n";
        answer += "Ether Price in CLP: " + (usd_clp*int_price).toFixed(1) + "\n";
        exchanges.forEach(function(exchange) {
          answer += "*" + exchange[0] + "*\n";
          if (exchange[3] === 'USD') {
            answer += "Ask: " + exchange[1].toFixed(2) + "(" + (exchange[1]*usd_clp).toFixed(1) + ")\n";
            answer += "Bid: " + exchange[2].toFixed(2) + "(" + (exchange[2]*usd_clp).toFixed(1) + ")\n";
          } else {
            answer += "Ask: " + exchange[1].toFixed(2) + "\n";
            answer += "Bid: " + exchange[2].toFixed(2) + "\n";
          }
        });
        answer += arbitrageCtrl.arbitrage_calc_message(exchanges, usd_clp) + "\n";
        telegram.sendMessage(message.chat.id, answer, {
          parse_mode: "Markdown"
        });
      }
      arbitrageCtrl.eth_prices(show_arbitrage);

    // ================================Miner Status=============================
    } else if (message.text.toLowerCase().indexOf("/miner") === 0) {
      if (!user.miner_address) {
        telegram.sendMessage(message.chat.id, "No miner address registered. To register one use the command /register_miner_address");
        return;
      }

      function send_status(error, answer, workers_count) {
        if (error) {
          telegram.sendMessage(message.chat.id, "ERROR on MinerStatus: " + error);
        } else {
          telegram.sendMessage(message.chat.id, answer, {
            parse_mode: "Markdown"
          });
          if (workers_count != user.n_workers) {
            telegram.sendMessage(message.chat.id, "*WARNING!*\nNumber of workers changed from " + user.n_workers + " to " + workers_count, {
              parse_mode: "Markdown"
            });
            user.n_workers = workers_count;
          }
        }
      }
      ethermineCtrl.miner_status_telegram(user.miner_address, send_status);

    // =============================Set Arbitrage Limit=========================
    } else if (message.text.toLowerCase().indexOf("/register_miner_address") === 0) {
      telegram.sendMessage(message.chat.id, "What's the miner address? If you want to delete you account send the word 'none' (WARNING, only ethermine.org is supported for now)", {
        parse_mode: "Markdown"
      });
      user.waiting_for_command = "register_miner_address";
      user.save();

    // =============================Set Arbitrage Limit=========================
    } else if (message.text.toLowerCase().indexOf("/set_arbitrage_minimum") === 0) {
      telegram.sendMessage(message.chat.id, "What's the new minimum limit to get alerted for? Choose 0 to disable alerts (Plain number, for example: 10000)", {
        parse_mode: "Markdown"
      });
      user.waiting_for_command = "set_arbitrage_minimum";
      user.save();

    // ===============================Something else============================
    } else {
      if (message.chat.id > 0) {
        telegram.sendMessage(message.chat.id, "Nope");
      }
    }
  }
}

function check_user(message, callback) {
  mongodb.User.findOne({ _id: message.chat.id }, function(err, user) {
    if (err == null && user == null) {
      var user = new mongodb.User({_id: message.chat.id, n_workers: 0, arbitrage_minimum_alert: undefined});
      user.save(function(err, user) {
        if (err) {
          console.log("Error while adding new user!! => " + err);
          telegram.sendMessage(message.chat.id, "Yeah sorry, couldn't register you here bruh. Try again or contact an admin.");
        } else {
          telegram.sendMessage(process.env.telegram_admin_id, "New user using the bot! => " + message.chat.id);
          callback(user, message);
        }
      });
    } else if (user && !err){
      callback(user, message);
    } else {
      console.log("ERROR when searching for user!");
    }
  });
}

telegram.on("text", (message) => {
  check_user(message, process_message);
});

module.exports = {
  arbitrage_alerts: arbitrage_alerts,
  telegram: telegram
}
