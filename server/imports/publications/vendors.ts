import { Meteor } from 'meteor/meteor';
import { Vendors } from '../../../both/collections/vendors.collection';

Meteor.publish('vendors', function() {
  return Vendors.find({}, { "sort": { "sortKey": 1 } });
});