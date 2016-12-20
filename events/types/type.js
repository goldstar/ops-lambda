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
  }

  process() {
    throw "Type.process is not implemented!"
  }
}
