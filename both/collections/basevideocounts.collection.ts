import { MongoObservable } from 'meteor-rxjs';

import { BaseVideoCount } from '../models/basevideocount.model';

export const BaseVideoCounts = new MongoObservable.Collection<BaseVideoCount>('basevideocounts');

function checkAvailable() {
  return true;
}

BaseVideoCounts.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
