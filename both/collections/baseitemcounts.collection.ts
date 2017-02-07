import { MongoObservable } from 'meteor-rxjs';

import { BaseItemCount } from '../models/baseitemcount.model';

export const BaseItemCounts = new MongoObservable.Collection<BaseItemCount>('baseitemscount');

function checkAvailable() {
  return true;
}

BaseItemCounts.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
