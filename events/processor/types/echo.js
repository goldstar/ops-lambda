import { TypeException, Type } from './index';

export default class Echo extends Type {
  process() {
    console.log(this.data); 
  }
}
