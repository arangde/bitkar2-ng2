import { MongoObservable } from 'meteor-rxjs';

export const Brands = new MongoObservable.Collection('brands');

function checkAvailable() {
  return true;
}

Brands.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
