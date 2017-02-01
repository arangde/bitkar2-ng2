import { MongoObservable } from 'meteor-rxjs';

export const AccessLogs = new MongoObservable.Collection('accesslogs');

function checkAvailable() {
  return true;
}

AccessLogs.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});
