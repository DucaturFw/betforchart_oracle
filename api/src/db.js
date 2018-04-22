let MongoClient = require('mongodb').MongoClient;

const DB_URL = 'mongodb://34.207.88.113:27017';
const DB_NAME = 'betchart';

function save_bet(bet) {
    return MongoClient.connect(DB_URL)
        .then(c =>
            c.db(DB_NAME).collection('bets')
            .insertOne(bet)
            .then(() => c.close())
        )
}

function get_bets() {
    return MongoClient.connect(DB_URL)
        .then(c => {
            bets = c.db(DB_NAME).collection('bets').find().toArray()
            bets.then(() => c.close());

            return bets
        })
}

function save_rates(rates) {
    return MongoClient.connect(DB_URL)
        .then(c =>
            c.db(DB_NAME).collection('rates')
            .insertOne(rates)
            .then(() => c.close())
        )
}

module.exports = {
    'save_bet': save_bet,
    'get_bets': get_bets,
    'save_rates': save_rates
};