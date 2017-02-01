import { MongoObservable } from 'meteor-rxjs';

import { ProductCount } from '../models/productcount.model';

export const ProductCounts = new MongoObservable.Collection<ProductCount>('productscount');

function checkAvailable() {
  return true;
}

ProductCounts.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
