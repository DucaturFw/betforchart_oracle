import * as express from "express"
import * as agent from "superagent"
import { isOpReturn, splitOpReturn } from "./blockchain";
import { wallet_address } from "./config";
import 'core-js/fn/object/entries';

export let app = express()

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
app.get("/crxs", (req, res) =>
{
	// TODO: put data into database and make CRON job.
	let pol = {};
	getCurrencyPoloniex((err, crxs) => { pol = crxs; });
	let hbtc = {};
	getCurrencyHitbtc((err, crxs) => { hbtc = crxs; });
	let bfin = {};
	getCurrencyBitfinex((err, crxs) => { bfin = crxs; });
	let cmc = {};
	getCurrencyCoinmarketcup((err, crxs) => { cmc = crxs; });
	let bin = {};
	getCurrencyBinance((err, crxs) => { bin = crxs; });
	return {
		pol, hbtc, bfin, cmc, bin
	}
})

interface ITransaction
{
	info: blinfo.rawaddr.Tx
	tx: blinfo.rawaddr.Out | blinfo.rawaddr.Out[]
	op_return?: { data: string, length: number }
}
interface IOrder
{
	hash: string
	data
}
interface IFullOrder
{
	order: IOrder
	tx: ITransaction
}
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
		
		let obj = res.body as JSON[]
		
		let crxs = {};
		Object.entries(obj).forEach(
			([key, value]) => {
				crxs[key] = {
					name: key,
					value: value.last,
					max: value.high24hr,
					min: value.low24hr,
				};
			}
		);

		return callback(undefined, crxs)
	})
}

function getCurrencyHitbtc(callback: (error, crxs: {}) => void) {
	let url = `https://api.hitbtc.com/api/2/public/ticker?limit=1000`
	agent.get(`${url}`, (err, res) =>
	{
		if (err)
			return callback(err, undefined)
		
		let obj = res.body as JSON[]
		
		let crxs = {};
		obj.forEach(
			(value) => {
				crxs[value["symbol"]] = {
					name: value["symbol"],
					value: value["last"],
					max: value["high"],
					min: value["low"],
				};
			}
		);

		return callback(undefined, crxs)
	})
}

function getCurrencyBitfinex(callback: (error, crxs: {}) => void, symbols: string = `tBTCUSD,tLTCUSD,fUSD`) {
	let url = `https://api.bitfinex.com/v2/tickers?symbols=`
	agent.get(`${url}${symbols}`, (err, res) =>
	{
		if (err)
			return callback(err, undefined)
		
		let obj = res.body as string[][]
		
		let crxs = {};
		obj.forEach(
			(value) => {
				crxs[value[0]] = {
					name: value[0],
					value: value[value.length - 3],
					max: value[value.length - 2],
					min: value[value.length - 1],
				};
			}
		);

		return callback(undefined, crxs)
	})
}

function getCurrencyCoinmarketcup(callback: (error, crxs: {}) => void) {
	let url = `https://api.coinmarketcap.com/v1/ticker/`
	agent.get(`${url}`, (err, res) =>
	{
		if (err)
			return callback(err, undefined)
		
		let obj = res.body as JSON[]
		
		let crxs = {};
		obj.forEach(
			(value) => {
				crxs[value["symbol"]] = {
					name: value["symbol"],
					value: value[value["price_usd"]],
				};
			}
		);

		return callback(undefined, crxs)
	})
}

function getCurrencyBinance(callback: (error, crxs: {}) => void) {
	let url = `https://api.binance.com/api/v1/ticker/24hr`
	agent.get(`${url}`, (err, res) =>
	{
		if (err)
			return callback(err, undefined)
		
		let obj = res.body as JSON[]
		
		let crxs = {};
		obj.forEach(
			(value) => {
				crxs[value["symbol"]] = {
					name: value["symbol"],
					value: value[value["lastPrice"]],
					max: value[value["highPrice"]],
					min: value[value["lowPrice"]],
				};
			}
		);

		return callback(undefined, crxs)
	})
}