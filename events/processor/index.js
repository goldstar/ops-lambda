'use strict';

import AWS from 'aws-sdk';
import uuid from 'uuid';

import Types from './types';
import Echo from './types/echo';

import { RecordException } from './types/exceptions';

Types.register('echo', Echo);

export default class Processor {
  constructor(event, kinesis) {
    this.kinesis = kinesis || new AWS.Kinesis();
    this.event = event;
  }

  process(callback) {
    if (!this.event.hasOwnProperty('Records') ||
        !Array.isArray(this.event.Records)) {
      throw new Error('event.Record is missing; this is bad!');
    }
    
    let success = [];
    let errors = [];
    this.event.Records.forEach((record) => {
      try {
        const data = this.getData(record);
        const processor = Types.create(data);
        processor.process();
        success.push(record);
      } catch (e) {
        this.badEvent(e, record);    
        errors.push(record);
      }
    });

    if (typeof callback === 'function') {
      callback(success, errors);
    }
  }

  getData(record) {
    if (!record.hasOwnProperty('kinesis') ||
        !record.kinesis.hasOwnProperty('data')) {
      throw new RecordException('Malformed Kinesis record', record);
    }

    let jsonBlob = '';
    try {
      jsonBlob = new Buffer(record.kinesis.data, 'base64').toString('ascii');
    } catch (e) {
      throw new RecordException('Could not base64 decode record', record);
    }

    let data = {};
    try {
      data = JSON.parse(jsonBlob);
    } catch (e) {
      throw new RecordException('Could not parse JSON from record data', record);
    }

    if (!data.hasOwnProperty('type')) {
      throw new RecordException('Event type not specified', record);
    }

    return data;
  }

  badEvent(e, record) {
    const payload = {
      'error': e,
      'record': record
    };

    const buf = new Buffer(JSON.stringify(payload));

    const params = {
      Data: buf.toString('base64'),
      PartitionKey: uuid.v1(),
      StreamName: process.env.errors_stream.split('/').pop()
    };

    this.kinesis.putRecord(params, (error, data) => {
      if (error) {
        console.log(error, data);
      }
    });
  }
}
