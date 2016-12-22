import { assert } from 'chai';
import sinon from 'sinon';
import Processor from '../../processor';
import AWS from 'aws-sdk';
import RecordException from '../../processor/types/exceptions';

describe('Processor', () => {
  describe('#constructor', () => {
    it('creates a Kinesis client when one is not provided', () => {
      const processor = new Processor({'Records': []});
      assert.instanceOf(processor.kinesis, AWS.Kinesis);
    });

    it('sets event', () => {
      const event = {'Records': []}
      const processor = new Processor(event);
      assert.equal(processor.event, event);
    });
  });

  describe('#getData', () => {
    it('fails when record has no `kinesis` key', () => {
      const processor = new Processor({});
      assert.throws(() => { processor.getData(record); }, RecordException);
    });

    it('fails when `kinesis` key has no `data` key', () => {
      const processor = new Processor({'kinesis': {}});
      assert.throws(() => { processor.getData(record); }, RecordException);
    });

    it('fails to base64 decode invalid `data`', () => {
      const record = {
        'kinesis': {
          'data': 2345
        }
      };

      const processor = new Processor(record);

      assert.throws(() => { processor.getData(record); }, RecordException);
    });

    it('fails to parse invalid JSON', () => {
      const record = {
        'kinesis': {
          'data': 'aGVsbG8gd29ybGQK'
        }
      };

      const processor = new Processor(record);

      assert.throws(() => { processor.getData(record); }, RecordException);
    });

    it('fails `data` has no key `type`', () => {
      const record = {
        'kinesis': {
          'data': 'eyJoZWxsbyI6ICJ3b3JsZCJ9Cg=='
        }
      };

      const processor = new Processor(record);

      assert.throws(() => { processor.getData(record); }, RecordException);
    });

    it('returns decoded and parsed data correctly', () => {
      const event = {
        'type': 'echo',
        'data': [1, 2, 3]
      };

      const record = {
        'kinesis': {
          'data': new Buffer(JSON.stringify(event)).toString('base64')
        }
      };

      const processor = new Processor(record);
      const data = processor.getData(record);
      assert.property(data, 'type');
      assert.equal(data.type, 'echo')
      assert.equal(data.data.length, 3);
    });
  });
});
