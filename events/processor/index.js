import AWS from 'aws-sdk';
import uuid from 'uuid';

import { Types } from './types';
import { RecordException } from './types/exceptions';

export default class Processor {
  constructor(event, kinesis) {
    this.kinesis = (kinesis === undefined) ? new AWS.Kinesis() : kinesis;
    this.event = event;
  }

  process(callback) {
    if (!this.event.hasOwnProperty('Records') ||
        !Array.isArray(this.event.Records)) {
      throw "event.Record is missing; this is bad!";
    }
    
    this.event.Records.forEach((record) => {
//      try {
        const data = this.getData(record);
        const processor = Types.create(data.type, data);
        processor.process();
//      } catch (e) {
//        this.badEvent(e, record);
//      }
    });

    if (typeof callback === 'function') {
      callback();
    }
  }

  getData(record) {
    if (!record.hasOwnProperty('kinesis') || !record.hasOwnProperty('data')) {
      throw RecordException("Malformed Kinesis record", record);
    }

    try {
      const buf = new Buffer(record.kinesis.data, 'base64').toString('ascii');
      const data = JSON.parse(buf);
    } catch (e) {
      throw RecordException("Could not base64 decode record", record);
    }

    if (!data.hasOwnProperty('type')) {
      throw RecordException("Event type not specified", record);
    }

    return data;
  }

  badEvent(e, record) {
    console.log(e);

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
        console.log(error);
      }
    });
  }
}
