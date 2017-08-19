# Ether monitor with telegram bot integration

Runs on a server with cron jobs and accepting commands through telegram as well as sending alerts to telegram users when required.

## Getting Started

1. Clone the repository
2. Create a mongo user with readWrite permissions
For test environment:
```
use test
var user = {
  "user" : "test",
  "pwd" : "test",
  roles : [
      {
          "role" : "readWrite",
          "db" : "test"
      }
  ]
}
db.createUser(user);
```
For production environment use a database called `ether` instead with custom user and password.

3. Set optional environment variables
* production_server=true/false
* telegram_api_key=YOUR_BOT_API_KEY
* etherscan_api_key=YOUR_ETHERSCAN_API_KEY
* mongo_username=YOUR_USERNAME
* mongo_password=YOUR_PASSWORD
4. Install dependencies `npm install`
5. Run the main script `node index.js`

### Prerequisites
Having Git, NodeJS and npm installed.

## Contributing

Contributions through pull requests are more than welcomed.

## Authors

Pedro Saratscheff @[psaratscheff](https://github.com/psaratscheff)

See also the list of [contributors](https://github.com/psaratscheff/ether-monitor/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License

## Extra comments

This is just a quick helper for my current needs, no intention so far to develop a more finished version.
