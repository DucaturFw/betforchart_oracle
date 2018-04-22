"use strict";
exports.__esModule = true;
var path_1 = require("path");
var fs_1 = require("fs");
exports.wallet_address = fs_1.readFileSync(path_1.join(__dirname, "../../api/config.yaml")).toString('utf8').split('\n').filter(function (x) { return x.startsWith('wallet_address'); })[0].match(/\:\s*(\S*)/)[1];
