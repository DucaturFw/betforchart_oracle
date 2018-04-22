"use strict";
exports.__esModule = true;
console.log("hello");
var restapi_1 = require("./restapi");
var fs_1 = require("fs");
var path = require("path");
restapi_1.app.get('/', function (req, res) {
    res.send(fs_1.readFileSync(path.join(__dirname, "../static/index.html")).toString('utf8'));
});
var PORT = 8814;
restapi_1.app.listen(PORT, function () {
    console.log("listening on " + PORT);
});
