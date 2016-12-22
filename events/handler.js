'use strict';

import Processor from './processor';

export function processEvent(event, context, callback) {
  const processor = new Processor(event);
  try {
    processor.process((success, errors) => {
      const msg = "Success = " + success.length + ", Errors = " + errors.length;
      callback(null, msg);
    });
  } catch (e) {
    callback(null, "ERROR: " + e);
  }
};
