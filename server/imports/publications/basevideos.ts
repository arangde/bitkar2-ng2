import { Meteor } from 'meteor/meteor';
import { BaseVideos } from '../../../both/collections/basevideos.collection';

Meteor.publish('basevideos', (options) => {
  const selector = {};

  if(options.vendor)
    selector['vendor'] = options.vendor;
  if(options.categoryId)
    selector['categoryId'] = options.categoryId;

  const videoIds = [];
  const ids = [];
  const baseVideos = BaseVideos.collection.find(selector, {sort:{ publishedAt: -1 }}).fetch();

  baseVideos.every((baseVideo) => {
    if(videoIds.indexOf(baseVideo.videoId) === -1) {
      videoIds.push(baseVideo.videoId);
      ids.push(baseVideo._id);
    }
    if(videoIds.length == options.limit)
      return false;
    else
      return true;
  });

  return BaseVideos.find({_id: {"$in": ids}}, {sort:{ publishedAt: -1 }});
});