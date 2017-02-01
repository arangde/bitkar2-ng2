import { Meteor } from 'meteor/meteor';
import { GlobalParts } from '../../../both/collections/globalparts.collection';

Meteor.publish('globalparts', function(options) {
  return GlobalParts.collection.find({ "PartID": options.partId });
});