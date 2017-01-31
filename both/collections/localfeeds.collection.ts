import { MongoObservable } from 'meteor-rxjs';

const localFeedsDB = new MongoInternals.RemoteCollectionDriver("mongodb://localhost:27017/localfeeds");

export const CJFeeds = new MongoObservable.Collection("cjfeeds", { _driver: localFeedsDB });
export const PJFeeds = new MongoObservable.Collection("pjfeeds", { _driver: localFeedsDB });

