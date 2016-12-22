import { InvalidType, InvalidTypeException } from './exceptions';

export class Type {
  constructor(data) {
    this.data = data;
  }
};

export const Types = {
  registeredTypes: new Map(),

  register(className, cls) {
    if (!(Factory.registeredTypes.has(className) &&
      cls.prototype instanceof Type)) {
      Factory._registeredTypes.add(className, cls);
    } else {
      throw new InvalidTypeException(cls);
    }
  },

  create(className, ...options) {
    if (!Factory.registeredTypes.has(className)) {
      throw InvalidType(className);
    }

    const cls = this.registeredTypes.get(className);
    const instance = new cls(...options);
    return instance;
  }
};
