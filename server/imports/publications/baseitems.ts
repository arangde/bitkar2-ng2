import { Meteor } from 'meteor/meteor';
import { BaseItems } from '../../../both/collections/baseitems.collection';

Meteor.publish('baseitems', function() {
  const selector = {};

  return BaseItems.collection.find(selector, {sort:{ title: 1 }});
});