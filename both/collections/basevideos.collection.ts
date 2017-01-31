import { MongoObservable } from 'meteor-rxjs';

import { BaseVideo } from '../models/basevideo.model';

export const BaseVideos = new MongoObservable.Collection<BaseVideo>('basevideos');

function checkAvailable() {
  return true;
}

BaseVideos.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
