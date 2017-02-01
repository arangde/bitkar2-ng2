import { MongoObservable } from 'meteor-rxjs';

import { Product } from '../models/product.model';

export const Products = new MongoObservable.Collection<Product>('products');

function checkAvailable() {
  return true;
}

Products.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
