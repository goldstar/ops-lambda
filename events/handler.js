'use strict';

import Processor from './processor';

module.exports.process_event = (event, context, callback) => {
  const processor = new Processor(event);
  processor.process(() => {
    callback(null, "Records have been processed");
  });
};
