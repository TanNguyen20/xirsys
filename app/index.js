const bodyParser = require('body-parser'),
    path = require('path'),
    config = require('config'),
    express = require('express'),
    cors = require('cors')
//
//  Basic Express App
//


let xirsys = config.get('xirsys');//Xirsys account info for API.

let webrtc = require('./routes/webrtc.js');//Xirsys API module

let app = express()
    .set('trust proxy', 'loopback')
    .use(cors())
    .use(express.json())//json parser
    .use(express.urlencoded({ extended: true }))//urlencoded parser
    .use(express.static(path.join(__dirname, 'public')))//path to examples
    .use("/webrtc", webrtc(xirsys));//watch API calls

module.exports = app;
