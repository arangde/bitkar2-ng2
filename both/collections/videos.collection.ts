import { MongoObservable } from 'meteor-rxjs';

import { Video } from '../models/video.model';

export const Videos = new MongoObservable.Collection<Video>('videos');

function checkAvailable() {
  return true;
}

Videos.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
