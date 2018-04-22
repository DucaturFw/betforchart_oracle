import { join } from "path";
import { readFileSync } from "fs";

export let wallet_address = readFileSync(join(__dirname, "../../api/config.yaml")).toString('utf8').split('\n').filter(x => x.startsWith('wallet_address'))[0].match(/\:\s*(\S*)/)[1]