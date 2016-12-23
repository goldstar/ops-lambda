import { InvalidTypeClassException, InvalidTypeException } from './exceptions';
import { Type } from './base';

const Types = {
  _registeredTypes: new Map(),

  register(className, cls) {
    if (!(Types._registeredTypes.has(className) &&
      cls.prototype instanceof Type)) {
      Types._registeredTypes.set(className, cls);
    } else {
      throw new InvalidTypeException(className, cls);
    }
  },

  create(data) {
    if (!Types._registeredTypes.has(data.type)) {
      throw new InvalidTypeClassException(data.type);
    }

    const cls = this._registeredTypes.get(data.type);
    const instance = new cls(data);
    return instance;
  }
};

export default Types;
