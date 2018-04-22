let read_yaml = require('read-yaml');

let hash_order = require('./hash_order');
let validate_order = require('./validate').validate_order;
let db = require('./db');

const config = read_yaml.sync('./config.yaml');

console.log('Config', config);

function create_bet(req, res) {
    // Validating request info
    if (!validate_order(req.body)) {
        res.status(400).send({ 'error': 'Request data is not valid.' });
    }

    let bet = {
        bet_info: {
            bet_currency: req.body.bet_info.currency,
            bet_for_value: parseFloat(req.body.bet_info.for_value),
            bet_amount: parseFloat(req.body.bet_info.amount),
        },
        user_info: {
            email: req.body.user_info.email
        },
        timestamp: Date.now(),
    }
    bet.hash = hash_order(bet);
    console.log('Saving the order:', bet)
        // Save order to database
    db.save_bet(bet)
        .then(() => {
            // Sending response
            res.status(201).send(bet);
        })
        .catch((err) => {
            console.log('Error', err);
            res.status(500).send({ 'error': 'Smth bad has happened.' });
        })
}

function get_bets(req, res) {
    db.get_bets()
        .then((orders) => res.status(200).send(orders))
        .catch((err) => {
            console.log('Error', err);
            res.status(500).send({ 'error': 'Smth bad has happened.' });
        })
}

module.exports = function routes(app) {
    app.post('/create_bet', create_bet);
    app.get('/get_bets', get_bets);
}