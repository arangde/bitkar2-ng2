import { MongoObservable } from 'meteor-rxjs';

export const ProductInfo = new MongoObservable.Collection<any>('productinfo');

function checkAvailable() {
  return true;
}

ProductInfo.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
