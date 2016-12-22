import { InvalidType, InvalidTypeException } from './exceptions';

const Types = {
  _registeredTypes: new Map(),

  register(className, cls) {
    if (!(Types._registeredTypes.has(className) &&
      cls.prototype instanceof Type)) {
      Types._registeredTypes.set(className, cls);
    } else {
      throw new InvalidTypeException(cls);
    }
  },

  create(data) {
    if (!Types._registeredTypes.has(data.type)) {
      throw new InvalidType(data.type);
    }

    const cls = this._registeredTypes.get(data.type);
    const instance = new cls(data);
    return instance;
  }
}

export default Types;
