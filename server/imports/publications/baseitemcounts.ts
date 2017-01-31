import { Meteor } from 'meteor/meteor';
import { BaseItemCounts } from '../../../both/collections/baseitemcounts.collection';

Meteor.publish('baseitemcounts', function() {
  const selector = {};

  return BaseItemCounts.find(selector);
});