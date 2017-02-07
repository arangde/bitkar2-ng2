import { Meteor } from 'meteor/meteor';
import { BaseItemCounts } from '../../../both/collections/baseitemcounts.collection';

Meteor.publish('baseitemcounts', function(filter) {
  const selector = {};

  if(filter.categoryId) {
    selector['categoryId'] = filter.categoryId;
  }
  else {
    selector['categoryId'] = 'all';
  }
  if(filter.vendor) {
    selector['vendor'] = filter.vendor;
  }

  return BaseItemCounts.find(selector);
});