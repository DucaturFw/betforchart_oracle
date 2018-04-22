"use strict";
exports.__esModule = true;
var express = require("express");
var agent = require("superagent");
exports.app = express();
var INFURA_URL = "https://ropsten.infura.io/1aSntAgaf8TCPtlVomPn";
// Require Web3 Module
var Web3 = require('web3');
function get_contract() {
    // Show web3 where it needs to look for the Ethereum node
    var web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/YOUR-API-TOKEN-HERE'));
    var abi = {}; // CONTRACT ABI
    var addr = ""; // CONTRACT ADDRESS
    return new web3.eth.Contract(abi, addr);
}
exports.app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
});
function _err(res, err) {
    res.json({ error: err });
}
exports.app.get("/crxs", function (req, res) {
    // TODO: put data into database and make CRON job.
    getCurrencyPoloniex(function (err, crxs) {
        var pol = crxs;
        if (err)
            console.error(err);
        console.log('got poloniex');
        return getCurrencyHitbtc(function (err, crxs) {
            var hbtc = crxs;
            if (err)
                console.error(err);
            console.log('got hitbtc');
            return getCurrencyBitfinex(function (err, crxs) {
                var bfin = crxs;
                if (err)
                    console.error(err);
                console.log('got bitfinex');
                console.log(pol["BTCUSD"]["value"]);
                var mean_btc_usd = (pol["BTCUSD"]["value"] + hbtc["BTCUSD"]["value"] + bfin["BTCUSD"]["value"]) / 3;
                console.log(mean_btc_usd);
                var mean_eth_usd = (pol["ETHUSD"]["value"] + hbtc["ETHUSD"]["value"] + bfin["ETHUSD"]["value"]) / 3;
                var mean_eth_btc = (pol["ETHBTC"]["value"] + hbtc["ETHBTC"]["value"] + bfin["ETHBTC"]["value"]) / 3;
                // const BetContract = get_contract(); 
                // BetContract.methods.setCurrency({"BTCUSD": mean_btc_usd, "ETHUSD": mean_eth_usd, "ETHBTC": mean_eth_btc}).send().then(console.log);
                return res.json({
                    pol: pol, hbtc: hbtc, bfin: bfin, mean_btc_usd: mean_btc_usd, mean_eth_usd: mean_eth_usd, mean_eth_btc: mean_eth_btc
                });
            });
        });
    });
});
function getCurrencyPoloniex(callback) {
    var url = "https://poloniex.com/public?command=returnTicker";
    agent.get("" + url, function (err, res) {
        if (err)
            return callback(err, undefined);
        var obj = res.body;
        var crxs = {};
        obj = {
            "BTCUSD": obj["USDT_BTC"],
            "ETHUSD": obj["USDT_ETH"],
            "LTCUSD": obj["USDT_LTC"],
            "ETHBTC": obj["BTC_ETH"],
            "LTCBTC": obj["BTC_LTC"]
        };
        Object.entries(obj).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            crxs[key] = {
                name: key,
                value: parseFloat(value.last),
                max: value.high24hr,
                min: value.low24hr
            };
        });
        return callback(undefined, crxs);
    });
}
function getCurrencyHitbtc(callback, symbols) {
    if (symbols === void 0) { symbols = "BTCUSD,LTCUSD,ETHBTC,ETHUSD,EOSUSD,EOSBTC,LTCBTC"; }
    var url = "https://api.hitbtc.com/api/2/public/ticker?limit=1000&symbol=";
    agent.get("" + url + symbols, function (err, res) {
        if (err)
            return callback(err, undefined);
        var obj = res.body;
        var crxs = {};
        obj.forEach(function (value) {
            if (symbols.includes(value["symbol"]))
                crxs[value["symbol"]] = {
                    name: value["symbol"],
                    value: parseFloat(value["last"]),
                    max: value["high"],
                    min: value["low"]
                };
        });
        return callback(undefined, crxs);
    });
}
function getCurrencyBitfinex(callback, symbols) {
    if (symbols === void 0) { symbols = "tBTCUSD,tLTCUSD,tETHBTC,tETHUSD,tEOSUSD,tEOSBTC,tLTCBTC"; }
    var url = "https://api.bitfinex.com/v2/tickers?symbols=";
    agent.get("" + url + symbols, function (err, res) {
        if (err)
            return callback(err, undefined);
        var obj = res.body;
        var crxs = {};
        obj.forEach(function (value) {
            crxs[value[0].replace('t', '')] = {
                name: value[0].replace('t', ''),
                value: parseFloat(value[value.length - 4]),
                max: value[value.length - 2],
                min: value[value.length - 1]
            };
        });
        return callback(undefined, crxs);
    });
}
