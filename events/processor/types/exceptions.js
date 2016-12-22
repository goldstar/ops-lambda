export class RecordException {
  constructor(message, record) {
    this.message = message;
    this.record = record;
  }
}

export class InvalidTypeException {
  constructor(cls) {
    this.cls = cls;
  }
}

export class InvalidType {
  constructor(className) {
    this.className = className;
  }
}
