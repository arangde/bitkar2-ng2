import { MongoObservable } from 'meteor-rxjs';

import { Product } from '../models/product.model';

export const BaseItems = new MongoObservable.Collection<Product>('baseitems');

function checkAvailable() {
  return true;
}

BaseItems.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
