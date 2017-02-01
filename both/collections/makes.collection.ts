import { MongoObservable } from 'meteor-rxjs';

import { Make } from '../models/make.model';

export const Makes = new MongoObservable.Collection<Make>('makes');

function checkAvailable() {
  return true;
}

Makes.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
