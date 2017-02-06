import { Meteor } from 'meteor/meteor';
import { BaseItems } from '../../../both/collections/baseitems.collection';

Meteor.publish('baseitems', function(filter, limit) {
  const options = {
    '$sort': {title: 1},
    '$limit': limit,
  };
  return BaseItems.find(filter, options);
});