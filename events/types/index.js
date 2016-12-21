const AWS = require('aws-sdk');
const uuid = require('uuid');

import Echo from './echo';

export class TypeException {
  constructor(message, record) {
    this.message = message
    this.record = record
  }
}

export class Type {
  constructor(record) {
    this.record = record

    if (!record.hasOwnProperty('kinesis') || !record.hasOwnProperty('data')) {
      throw TypeException("Malformed Kinesis record", this.record)
    }

    try {
      const buf = new Buffer(this.record.kinesis.data, 'base64').toString('ascii');
      this.data = JSON.parse(buf);
    } catch (e) {
      throw TypeException("Could not base64 decode record", this.record)
    }

    if (!this.data.hasOwnProperty('type')) {
      throw TypeException("Event has not type", this.record)
    }

    if (!this.types.hasOwnProperty(this.data.type)) {
      throw TypeException("Event type is unknown", this.record)
    }
  }
}

export class Processor {
  constructor(event) {
    this.kinesis = new AWS.Kinesis();
    this.event = event;
    this.types = {
      'echo': Echo
    };
  }

  process(callback) {
    if (!this.event.hasOwnProperty('Records') ||
        !Array.isArray(this.event.Records) {
      throw "event.Record is missing; this is bad!"
    }
    
    this.event.Records.forEach((record) => {
      processor = new this.types[this.data.type](record)
      try {
        processor.process()
      } catch (e) {
        this.badEvent(e, record);
      }
    }

    if (typeof callback === 'function')
      callback();
    }
  }

  badEvent(e, record) {
    const params = {
      Data: {
        'error': e,
        'record': record
      },
      PartitionKey: uuid.v1(),
      StreamName: process.env.errors_stream
    };

    this.kinesis.putRecord(params, (error, data) => {
      if (error) {
        console.log(error);
      }
    });
  }
}
