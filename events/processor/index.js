import AWS from 'aws-sdk';
import uuid from 'uuid';

import Echo from './types/echo';

export default class Processor {
  constructor(event) {
    this.kinesis = new AWS.Kinesis();
    this.event = event;
    this.types = {
      'echo': Echo
    };
  }

  process(callback) {
    if (!this.event.hasOwnProperty('Records') ||
        !Array.isArray(this.event.Records)) {
      throw "event.Record is missing; this is bad!";
    }
    
    this.event.Records.forEach((record) => {
      try {
        const data = this.getData(record);
        const processor = new this.types[data.type](data);
        processor.process();
      } catch (e) {
        this.badEvent(e, record);
      }
    });

    if (typeof callback === 'function') {
      callback();
    }
  }

  getData(record) {
    if (!record.hasOwnProperty('kinesis') || !record.hasOwnProperty('data')) {
      throw TypeException("Malformed Kinesis record", this.record);
    }

    try {
      const buf = new Buffer(this.record.kinesis.data, 'base64').toString('ascii');
      const data = JSON.parse(buf);
    } catch (e) {
      throw TypeException("Could not base64 decode record", this.record);
    }

    if (!data.hasOwnProperty('type')) {
      throw TypeException("Event type not specified", this.record);
    }

    if (!this.types.hasOwnProperty(data.type)) {
      throw TypeException("Event type is unknown", this.record);
    }
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
        console.log(error);
      }
    });
  }
}
