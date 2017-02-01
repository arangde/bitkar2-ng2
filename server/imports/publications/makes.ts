import { Meteor } from 'meteor/meteor';
import { Makes } from '../../../both/collections/makes.collection';

Meteor.publish('makes', function() {
  return Makes.collection.find({});
});