import { Type } from './base';

export default class Echo extends Type {
  process() {
    this.log(this.data);
  }

  log(data) {
    console.log(data); 
  }
}
