import { Type } from './base';

export default class Echo extends Type {
  process() {
    console.log(this.data); 
  }
}
