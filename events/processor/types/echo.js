import { Type, Types } from './index';

export default class Echo extends Type {
  process() {
    console.log(this.data); 
  }
}

Types.register('echo', Echo);
