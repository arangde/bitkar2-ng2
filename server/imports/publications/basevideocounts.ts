import { Meteor } from 'meteor/meteor';
import { BaseVideoCounts } from '../../../both/collections/basevideocounts.collection';

Meteor.publish('basevideocounts', (filter) => {
  const selector = {};

  if(filter.categoryId) {
    selector['categoryId'] = filter.categoryId;
  }
  if(filter.vendor) {
    selector['vendor'] = filter.vendor;
  }

  return BaseVideoCounts.find(selector);
});