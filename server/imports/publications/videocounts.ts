import { Meteor } from 'meteor/meteor';
import { VideoCounts } from '../../../both/collections/videocounts.collection';

Meteor.publish('videocounts', function(filter) {
  var selector = {};

  if (filter.sessionId) {
    selector['sessionId'] = filter.sessionId;
  }

  return VideoCounts.collection.find(selector, {limit: 1});
});