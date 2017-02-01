import { Meteor } from 'meteor/meteor';
import { Videos } from '../../../both/collections/videos.collection';

Meteor.publish('videos', function(filter) {
  var selector = {};

  if (filter.sessionId) {
    selector['sessionId'] = filter.sessionId;
  }

  return Videos.collection.find(selector, {limit: 6});
});