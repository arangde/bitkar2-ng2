import { MongoObservable } from 'meteor-rxjs';

import { BaseItem } from '../models/baseitem.model';

export const BaseItems = new MongoObservable.Collection<BaseItem>('baseitems');

function checkAvailable() {
  return true;
}

BaseItems.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
