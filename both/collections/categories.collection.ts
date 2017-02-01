import { MongoObservable } from 'meteor-rxjs';

import { Category } from '../models/category.model';

export const Categories = new MongoObservable.Collection<Category>('categories');

function checkAvailable() {
  return true;
}

Categories.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
