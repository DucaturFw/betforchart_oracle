"use strict";
exports.__esModule = true;
var express = require("express");
var agent = require("superagent");
exports.app = express();
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
                return res.json({
                    pol: pol, hbtc: hbtc, bfin: bfin
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
                value: value.last,
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
                    value: value["last"],
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
                value: value[value.length - 4],
                max: value[value.length - 2],
                min: value[value.length - 1]
            };
        });
        return callback(undefined, crxs);
    });
}
