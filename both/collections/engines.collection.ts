import { MongoObservable } from 'meteor-rxjs';

import { Engine } from '../models/engine.model';

export const Engines = new MongoObservable.Collection<Engine>('enginelegacies');

function checkAvailable() {
  return true;
}

Engines.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
