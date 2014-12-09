var request = require('request');
var url = require('url');
var async = require('async');
var constants = require('./constants.js');

request.defaults({
    jar: true,
    followAllRedirects: true
});
var j = request.jar();
var CFID, CFTOKEN;

var toNumbers = [];


function sendSMS(message, who) {
    toNumbers.push(who);
    var smsUrl2 = 'https://myaccount.emobile.ie/myemobileapi/index.cfm?event=smsAjax&CFID=' + CFID + '&CFTOKEN=' + CFTOKEN + '&func=addEnteredMsisdns';
    var smsUrl3 = 'https://myaccount.emobile.ie/myemobileapi/index.cfm?event=smsAjax&func=sendSMS&CFID=' + CFID + '&CFTOKEN=' + CFTOKEN;

    var queue = [];
    for (var i = 0; i < toNumbers.length; i++) {
        queue.push(async.apply(addMSISDN, toNumbers[i]));
    }

    function addMSISDN(MSISDN, cb) {
        // Each MSISDN needs to be added via the emoible addEnteredMsisdns function
        request.post({
            url: smsUrl2,
            jar: j,
            form: {
                ajaxRequest: 'addEnteredMSISDNs',
                remove: '-',
                add: '0|' + MSISDN
            }
        }, function(error, response, body) {
            if (error) {
                return cb(error, null);
            }
            return cb(null, {
                status: 'ok',
                msg: 'Added ' + MSISDN
            });
        });
    }


    async.parallel(queue, function(err, ful) {
        if (err) {
            return callback(err, null);
        }
        request.post({
            url: smsUrl3,
            jar: j,
            form: {
                ajaxRequest: 'sendSMS',
                messageText: message
            }
        }, function(a, b, c) {
            console.log("Status :: ", b.statusCode);
            process.exit(0);
        });
    });
}


module.exports = {
    // First thing first. Login.
    //TODO: Do I always need to login? CFTOKEN
    login: function(message, who) {
        request.post({
            url: constants.LOGIN_URL,
            jar: j,
            form: {
                username: constants.MOBILE,
                userpass: constants.PIN,
                x: constants.X,
                y: constants.Y
            }
        }, function(error, response, body) {
            request.get({
                url: constants.ORIGIN + response.headers.location,
                jar: j
            }, function(a, b, c) {
                var queryData = url.parse(constants.ORIGIN + response.headers.location, true).query;
                CFID = queryData.CFID;
                CFTOKEN = queryData.CFTOKEN;
                sendSMS(message, who);

            });
        });
    }
};