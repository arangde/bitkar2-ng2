import { Mongo } from 'meteor/mongo';

const localFeedsDB = new MongoInternals.RemoteCollectionDriver("mongodb://localhost:27017/localfeeds");

export const CJFeeds = new Mongo.Collection("cjfeeds", { _driver: localFeedsDB });
export const PJFeeds = new Mongo.Collection("pjfeeds", { _driver: localFeedsDB });

