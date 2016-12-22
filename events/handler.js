'use strict';

import Processor from './processor';

export function process_event(event, context, callback) {
  const processor = new Processor(event);
  processor.process(() => {
    callback(null, "Records have been processed");
  });
};
