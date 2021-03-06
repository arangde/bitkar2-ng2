import { MongoObservable } from 'meteor-rxjs';

import { Brand } from '../models/brand.model';

export const Brands = new MongoObservable.Collection<Brand>('brands');

function checkAvailable() {
  return true;
}

Brands.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
