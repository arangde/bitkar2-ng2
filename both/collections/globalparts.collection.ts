import { MongoObservable } from 'meteor-rxjs';

import { GlobalPart } from '../models/globalpart.model';

export const GlobalParts = new MongoObservable.Collection<GlobalPart>('globalparts');

function checkAvailable() {
  return true;
}

GlobalParts.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
