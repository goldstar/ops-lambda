'use strict';

const AWS = require('aws-sdk')
const uuid = require('uuid')

module.exports.errors = (event, context, callback) => {
  event.Records.forEach((record) => {
    var buf = new Buffer(record.kinesis.data, 'base64').toString('ascii');
    var data = JSON.parse(buf); 
    console.log("Log data received = " + JSON.stringify(data))
  });

  callback(null, "Success");
};
