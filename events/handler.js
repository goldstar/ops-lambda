'use strict';

import Processor from './processor';

export function processEvent(event, context, callback) {
  const processor = new Processor(event);
  processor.process((success, errors) => {
    const msg = "Success = " + success.length + ", Errors = " + errors.length;
    callback(null, msg);
  });
};
