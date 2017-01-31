import { MongoObservable } from 'meteor-rxjs';

import { Vendor } from '../models/vendor.model';

export const Vendors = new MongoObservable.Collection<Vendor>('vendors');

function checkAvailable() {
  return true;
}

Vendors.allow({
  insert: checkAvailable,
  update: checkAvailable,
  remove: checkAvailable
});

export function getVendorKey(name) {
  var vendor = Vendors.collection.findOne({name: name});
  if(vendor) {
    return vendor.key;
  }
  return "_";
}

export function getVendorFeed(key) {
  var vendor = Vendors.collection.findOne({key: key});
  if(vendor) {
    return vendor.feed;
  }
  return "";
}

export function getVendorName(key) {
  var vendor = Vendors.collection.findOne({key: key});
  if(vendor) {
    return vendor.name;
  }
  return "";
}
