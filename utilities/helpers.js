// controllers/helpers.js

var mongodb     = require(__dirname + '/../database/main.js');

function iterate_users(iterative_function) {
  mongodb.User.find({}, function(err, users) {
    if (err) {
      console.log("ERROR on retrieving user list!!");
    } else {
      users.forEach(function(user) {
        iterative_function(user);
      });
    }
  });
}

module.exports = {
    iterate_users: iterate_users
};
