import { MongoObservable } from 'meteor-rxjs';

import { VideoCount } from '../models/videocount.model';

export const VideoCounts = new MongoObservable.Collection<VideoCount>('videoscount');

function checkAvailable() {
  return true;
}

VideoCounts.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
