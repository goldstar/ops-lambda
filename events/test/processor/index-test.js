import { assert } from 'chai';
import sinon from 'sinon';
import Processor from '../../processor';
import AWS from 'aws-sdk';
import RecordException from '../../processor/types/exceptions';
import Echo from '../../processor/types/echo';


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

  describe('#process', () => {
    it('fails when `Records` is not present', () => {
      const processor = new Processor({});
      assert.throws(() => { processor.process(); }, /Record is missing/);
    });

    it('calls the callback when done', sinon.test(function() {
      const event = {
        'Records': [
          {
            'kinesis': {
              'data': new Buffer(JSON.stringify({
                'type': 'echo',
                'data': [1, 2, 3]
              })).toString('base64') 
            }
          }
        ]
      }

      const processor = new Processor(event);
      const callback = this.spy(); 
      this.stub(Echo.prototype, 'log');
      
      processor.process(callback);
      sinon.assert.calledOnce(callback);
      sinon.assert.calledWith(callback, [event.Records[0]], []);
    }));

    it('calls type class for processing', sinon.test(function() {
      const event = {
        'Records': [
          {
            'kinesis': {
              'data': new Buffer(JSON.stringify({
                'type': 'echo',
                'data': [1, 2, 3]
              })).toString('base64') 
            }
          }
        ]
      }

      const processor = new Processor(event);
      const callback = this.spy();
      const processStub = this.stub(Echo.prototype, 'process');

      processor.process(callback);
      sinon.assert.calledOnce(processStub);
      sinon.assert.called(callback);
    }));

    it('calls #badEvent on bad records', sinon.test(function() {
      const event = {
        'Records': [
          {
            'kinesis': {
              'data': new Buffer(JSON.stringify({
                'type': 'echo',
                'data': [1, 2, 3]
              })).toString('base64') 
            }
          }
        ]
      }

      const processor = new Processor(event);
      const callback = this.spy();
      const processStub = this.stub(Echo.prototype, 'process').throws();
      const badEventStub = this.stub(Processor.prototype, 'badEvent');

      processor.process(callback);
      sinon.assert.calledWith(badEventStub, new Error(), event.Records[0]);
      sinon.assert.calledWith(callback, [], [event.Records[0]]);
    }));
  });

  describe('#badEvent', () => {
    it('sends bad records to Kinesis errors stream', sinon.test(function() {
      process.env.errors_stream = "arn:aws:kinesis:::stream/goldstar-foo-events-errors";
        
      const event = {
        'Records': [
          {
            'kinesis': {
              'data': new Buffer(JSON.stringify({
                'type': 'echo',
                'data': [1, 2, 3]
              })).toString('base64') 
            }
          }
        ]
      }

      // Stub out a Kinesis client.
      const kinesisStub = this.stub();
      kinesisStub.putRecord = this.stub(); 

      // Make sure Echo.process() throws an exception triggering badEvent.
      const processStub = this.stub(Echo.prototype, 'process').throws();

      const callback = this.spy();
      const processor = new Processor(event, kinesisStub);
      processor.process(callback);
      sinon.assert.calledOnce(kinesisStub.putRecord);
    }));
  });
});
