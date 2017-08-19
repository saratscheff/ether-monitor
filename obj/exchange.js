// obj/exchange.js

// Class instantiation
var ex = Exchange.prototype;

// Constructor
function Exchange(name, ask, bid, boring_currency) {
    this.name = name;
    this.ask = ask;
    this.bid = bid;
    this.boring_currency = boring_currency;
}

// Methods
// ex.doSomething = function() {
//     return something?;
// };

// TODO: implement ask,bid update requests to exchange-specific childs
// inheriting common properties + singletons
// Avoids unnecesary requests, scalable

// TODO: private/public implementation of objects?

module.exports = Exchange;
