## Oracle for bet rates

### Run:

    tsc
    yarn
    pm2 start js/app.js

### Crontab:

    */5 * * * * wget http://localhost:8814/crxs
