let crypto = require('crypto');
let sort_object = require('deep-sort-object');

module.exports = function hash_order(order) {
    let order_string = JSON.stringify(sort_object(order));

    return crypto.createHmac('sha256', order_string).digest('hex');
}
