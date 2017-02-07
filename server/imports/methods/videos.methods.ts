/**
 * Created by jaran on 10/14/2016.
 */
import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import logger from 'winston';
import * as YoutubeSearch from "youtube-search";
import * as _ from 'underscore';
import { Videos } from '../../../both/collections/videos.collection';
import { VideoCounts } from '../../../both/collections/videocounts.collection';

if(Meteor.isServer) {

  Meteor.methods({
    'findVideos': function (filters, options) {
      const keywords = [];

      _.forEach(filters, function (value, key) {
        if (value != "") {
          keywords.push(value);
        }
      });

      let now = new Date();
      const q = keywords.join(" ").trim();

      let order = 'relevance';
      if (q == "") {
        order = 'viewCount';
      }

      const searchOptions: YoutubeSearch.YouTubeSearchOptions = {
        key: Meteor.settings['youtubeKey'],
        part: "snippet",
        publishedAfter: (now.getFullYear() - 3) + "-01-01T00:00:00Z",
        videoCaption: "closedCaption",
        type: "video",
        maxResults: 6,
        videoCategoryId: "2", // Autos & Vehicles,
        regionCode: "US",
        order: order,
      };

      if (options.pageToken) {
        searchOptions.pageToken = options.pageToken;
      }
      console.log('searchOptions', searchOptions);

      YoutubeSearch(q, searchOptions, Meteor.bindEnvironment((err, items, pageInfo) => {
        Videos.collection.remove({"sessionId": options.sessionId});
        VideoCounts.collection.remove({"sessionId": options.sessionId});

        if (err) {
          console.error(err);
        }
        else {
          if (Match.test(items, Match.Any) && items != undefined) {
            now = new Date();
            const videoCount = {
              sessionId: options.sessionId,
              totalResults: pageInfo.totalResults,
              resultsPerPage: pageInfo.resultsPerPage,
              totalPages: Math.ceil(pageInfo.totalResults / pageInfo.resultsPerPage),
              nextPageToken: pageInfo.nextPageToken,
              prevPageToken: pageInfo.prevPageToken,
              lastActivity: now.getTime(),
            };
            VideoCounts.insert(videoCount);

            _.each(items, function (item, i) {
              const video = {
                videoId: item.id,
                title: item.title,
                thumbnail: item.thumbnails['default']['url'],
                url: "https://youtu.be/" + item.id,
                sessionId: options.sessionId,
                lastActivity: now.getTime(),
              };
              Videos.insert(video);
            });
          }
          else {
            console.error("Youtube could not search with keywords");
          }
        }
      }));
    }
  });
}
