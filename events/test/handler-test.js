'use strict';

import { assert } from 'chai';
import sinon from 'sinon';
import * as handlers from '../handler';
import Echo from '../processor/types/echo';

describe('handlers', () => {
  describe('#processEvent', () => {
    it('should log data when there are records', sinon.test(function() {
      const loggingStub = this.stub(Echo.prototype, 'log');
      const callback = this.spy();
      const event = {
        'Records': [
          {
            'kinesis': {
              'data': 'ewogICJ0eXBlIjogImVjaG8iLAogICJkYXRhIjogewogICAgIm51bWJlcnMiOiBbMSwgMiwgM10KICB9Cn0K'
            }
          }
        ]
      }

      handlers.processEvent(event, this.spy(), callback);
      assert.isTrue(callback.calledOnce);
      assert.isTrue(callback.calledWith(null, "Success = 1, Errors = 0"));
      assert.isTrue(loggingStub.calledOnce);
    }));
  });
});
