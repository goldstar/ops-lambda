export class RecordException {
  constructor(message, record) {
    this.message = message;
    this.record = record;
  }
}

export class InvalidTypeException {
  constructor(className, cls) {
    this.className = className;
    this.cls = cls;
  }
}

export class InvalidTypeClassException {
  constructor(className) {
    this.className = className;
  }
}
