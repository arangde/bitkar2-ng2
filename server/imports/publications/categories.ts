import { Meteor } from 'meteor/meteor';
import { Categories } from '../../../both/collections/categories.collection';

Meteor.publish('categories', function() {
  const selector = {};

  return Categories.collection.find(selector);
});