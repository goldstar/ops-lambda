'use strict';

const assert = require('chai').assert;
const sinon = require('sinon');
const handlers = require('../handler');

describe('handlers', () => {
  describe('#errors', () => {
    it('should log data when there are records', sinon.test(function() {
      this.spy(console, 'log');
      const callback = this.spy();
      const event = {
        'Records': [
          {
            'kinesis': {
              'data': 'eyJzdWNjZXNzIjogdHJ1ZX0K'
            }
          }
        ]
      }

      handlers.errors(event, this.spy(), callback);
      assert.isTrue(console.log.calledOnce);
      assert.isTrue(callback.calledOnce);
      assert.isTrue(callback.calledWith(null, "Success"));
    }));

    it('should not log data when there are no records', sinon.test(function() {
      this.spy(console, 'log');
      const callback = this.spy();
      const event = {
        'Records': []
      }

      handlers.errors(event, this.spy(), callback);
      assert.isFalse(console.log.called);
      assert.isTrue(callback.calledOnce);
      assert.isTrue(callback.calledWith(null, "Success"));
    }));
  });
});
