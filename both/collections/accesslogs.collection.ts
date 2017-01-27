import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

export const AccessLogs = new MongoObservable.Collection('accesslogs');

function checkAvailable() {
  return true;
}

AccessLogs.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
