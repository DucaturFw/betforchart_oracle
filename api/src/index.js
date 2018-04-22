let express = require('express');
var bodyParser = require('body-parser');

var routes = require('./routes.js');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all('*', function(req, res, next) {
    let allow_origin = req.get('Access-Control-Allow-Origin') || '*';
    let allow_headers = req.get('Access-Control-Request-Headers') || 'X-Requested-With';

    res.header('Access-Control-Allow-Origin', allow_origin);
    res.header('Access-Control-Allow-Headers', allow_headers);

    next();
});

routes(app);

app.listen(3000, () => console.log('Listening on port 3000!'));
