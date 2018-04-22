import * as express from "express"
import * as agent from "superagent"
import { isOpReturn, splitOpReturn } from "./blockchain";
import { wallet_address } from "./config";

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
				return res.json({
					pol, hbtc, bfin
				})
			});
		});
	});
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
					value: value.last,
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
						value: value["last"],
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
					value: value[value.length - 4],
					max: value[value.length - 2],
					min: value[value.length - 1],
				};
			}
		);

		return callback(undefined, crxs)
	})
}
