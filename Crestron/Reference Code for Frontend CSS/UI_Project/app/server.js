/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */

 
'use strict';

const
    express = require('express'),
    dotenv = require('dotenv');
	
dotenv.config();

let port = process.env.HOST_PORT,
    ip = process.env.HOST_ADDRESS;

express()
    // .use('/libs', express.static(__dirname + '/bower_components'))
    // .use('/vendors', express.static(__dirname + '/vendors'))
    .use('/', express.static(__dirname + '/public'))
    .use('/', express.static(__dirname + '/'))
    .all('*', (req, res) => res.sendFile(__dirname + '/public/index.html'))
    .listen(port, ip, console.log.bind(console, `Listening on ${ip}:${port}`));