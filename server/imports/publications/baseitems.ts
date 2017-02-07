import { Meteor } from 'meteor/meteor';
import { BaseItems } from '../../../both/collections/baseitems.collection';

Meteor.publish('baseitems', function(filter) {
  const options = {
    'sort': {title: 1},
    'limit': filter.limit,
  };

  const selector = {};
  if(filter.categoryId) {
    selector['categoryId'] = filter.categoryId;
  }
  if(filter.vendor) {
    selector['vendor'] = filter.vendor;
  }

  console.log(selector, options);
  return BaseItems.find(selector, options);
});