'use strict';

import Processor from './types';

module.exports.process_event = (event, context, callback) => {
  processor = new Processor(event);
  processor.process(() => {
    callback(null, "Records have been processed");
  });
};
