import * as express from "express"
import * as agent from "superagent"
import { isOpReturn, splitOpReturn } from "./blockchain";
import { wallet_address } from "./config";
import * as _ from "lodash";

export let app = express()

const INFURA_URL = `https://ropsten.infura.io/1aSntAgaf8TCPtlVomPn`
// Require Web3 Module
var Web3 = require('web3');

function getContract() {
	// Show web3 where it needs to look for the Ethereum node
	const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/YOUR-API-TOKEN-HERE'));
	const abi = {} // CONTRACT ABI
	const addr = "" // CONTRACT ADDRESS
	return new web3.eth.Contract(abi, addr);
}

function meanByFilterMostOutstanding(values) {
	const meanVal = _.mean(values)
	const diffs = values.map(v => Math.abs(v - meanVal))
	const indexToDrop = _.indexOf(diffs, _.max(diffs))

	const valCopy = _.clone(values)
	valCopy[indexToDrop] = 0
	return _.mean(values);
}

app.all('*', function(req, res, next)
{
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'X-Requested-With')

    next()
})

function _err(res, err)
{
	res.json({ error: err })
}

function getByKey(arr, key) {
	const vals = arr.map(k => k[key]["value"])
	return meanByFilterMostOutstanding(vals)
}

app.get("/crxs", (req, res) =>
{
	// TODO: put data into database and make CRON job.
	getCurrencyPoloniex((err, crxs) => {
		let pol = crxs;
		if (err) console.error(err);
		console.log('got poloniex')
		return getCurrencyHitbtc((err, crxs) => {
			let hbtc = crxs;
			if (err) console.error(err);
			console.log('got hitbtc')
			return getCurrencyBitfinex((err, crxs) => {
				let bfin = crxs;
				if (err) console.error(err);
				console.log('got bitfinex')
				const arr = [pol, hbtc, bfin]
				let mean_btc_usd = getByKey(arr, `BTCUSD`)
				let mean_eth_usd = getByKey(arr, `ETHUSD`)
				let mean_eth_btc = getByKey(arr, `ETHBTC`)
				let mean_ltc_btc = getByKey(arr, `LTCBTC`)
				// const BetContract = getContract(); 
				// BetContract.methods.setRate(Math.round(mean_btc_usd * 100)).send().then(console.log);
				return res.json({
					pol, hbtc, bfin, mean_btc_usd, mean_eth_usd, mean_eth_btc, mean_ltc_btc
				})
			});
		});
	});
})

interface ICurrency
{
	name: string,
	value: number,
	min?: number,
	max?: number,
}

function getCurrencyPoloniex(callback: (error, crxs: {}) => void) {
	let url = `https://poloniex.com/public?command=returnTicker`
	agent.get(`${url}`, (err, res) =>
	{
		if (err)
			return callback(err, undefined)
		
		let obj = res.body as {}
		
		let crxs = {};
		obj = {
			"BTCUSD": obj["USDT_BTC"],
			"ETHUSD": obj["USDT_ETH"],
			"LTCUSD": obj["USDT_LTC"],
			"ETHBTC": obj["BTC_ETH"],
			"LTCBTC": obj["BTC_LTC"],
		}
		Object.entries(obj).forEach(
			([key, value]) => {
				crxs[key] = {
					name: key,
					value: parseFloat(value.last),
					max: value.high24hr,
					min: value.low24hr,
				};
			}
		);

		return callback(undefined, crxs)
	})
}

function getCurrencyHitbtc(callback: (error, crxs: {}) => void, symbols: string = `BTCUSD,LTCUSD,ETHBTC,ETHUSD,EOSUSD,EOSBTC,LTCBTC`) {
	let url = `https://api.hitbtc.com/api/2/public/ticker?limit=1000&symbol=`
	agent.get(`${url}${symbols}`, (err, res) =>
	{
		if (err)
			return callback(err, undefined)
		
		let obj = res.body as JSON[]
		
		let crxs = {};
		obj.forEach(
			(value) => {
				if (symbols.includes(value["symbol"]))
					crxs[value["symbol"]] = {
						name: value["symbol"],
						value: parseFloat(value["last"]),
						max: value["high"],
						min: value["low"],
					};
			}
		);

		return callback(undefined, crxs)
	})
}

function getCurrencyBitfinex(callback: (error, crxs: {}) => void, symbols: string = `tBTCUSD,tLTCUSD,tETHBTC,tETHUSD,tEOSUSD,tEOSBTC,tLTCBTC`) {
	let url = `https://api.bitfinex.com/v2/tickers?symbols=`
	agent.get(`${url}${symbols}`, (err, res) =>
	{
		if (err)
			return callback(err, undefined)
		
		let obj = res.body as string[][]
		
		let crxs = {};
		obj.forEach(
			(value) => {
				crxs[value[0].replace('t','')] = {
					name: value[0].replace('t',''),
					value: parseFloat(value[value.length - 4]),
					max: value[value.length - 2],
					min: value[value.length - 1],
				};
			}
		);

		return callback(undefined, crxs)
	})
}
