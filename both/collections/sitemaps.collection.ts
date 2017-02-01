import { MongoObservable } from 'meteor-rxjs';

import { Sitemap } from '../models/sitemap.model';

export const Sitemaps = new MongoObservable.Collection<Sitemap>('sitemaps');

function checkAvailable() {
  return true;
}

Sitemaps.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
