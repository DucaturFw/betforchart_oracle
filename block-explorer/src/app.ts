console.log("hello")

import { app } from "./restapi"
import { readFileSync } from "fs";
import * as path from "path";

app.get('/', (req, res) =>
{
	res.send(readFileSync(path.join(__dirname, "../static/index.html")).toString('utf8'))
})

const PORT = 8814
app.listen(PORT, () =>
{
	console.log(`listening on ${PORT}`)
	
})