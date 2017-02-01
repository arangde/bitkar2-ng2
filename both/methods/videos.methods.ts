/**
 * Created by jaran on 10/14/2016.
 */
import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { Videos } from '../collections/videos.collection';
import YoutubeApi from 'meteor/renaldo:youtube-api';
import { VideoCounts } from '../collections/videocounts.collection';


if(Meteor.isServer) {
  YoutubeApi.authenticate({
    type: 'key',
    key: Meteor.settings.youtubeKey
  });

  Meteor.methods({
    'searchVideo': function (filters, options) {
      const keywords = [];

      _.forEach(filters, function (value, key) {
        if (value != "") {
          keywords.push(value);
        }
      });

      const query = keywords.join(" ").trim();
      var order = 'relevance';
      if (query == "") {
        order = 'viewCount';
      }

      var videoCaption = "closedCaption";
      var now = new Date();

      var searchOptions = {
        part: "snippet",
        publishedAfter: (now.getFullYear() - 3) + "-01-01T00:00:00Z",
        videoCaption: videoCaption,
        type: "video",
        maxResults: 6,
        q: query,
        videoCategoryId: "2", // Autos & Vehicles,
        regionCode: "US",
        order: order
      };

      if (options.pageToken) {
        searchOptions.pageToken = options.pageToken;
      }
      console.log('searchOptions', searchOptions);

      YoutubeApi.search.list(searchOptions, Meteor.bindEnvironment(function (err, data) {
        Videos.collection.remove({"sessionId": options.sessionId});
        VideoCounts.collection.remove({"sessionId": options.sessionId});

        if (err) {
          console.error(err);
        }
        else {
          if (Match.test(data.items, Match.Any) && data.items != undefined) {
            const now = new Date();
            var videoCount = {
              sessionId: options.sessionId,
              totalResults: data.pageInfo.totalResults,
              resultsPerPage: data.pageInfo.resultsPerPage,
              totalPages: Math.ceil(data.pageInfo.totalResults / data.pageInfo.resultsPerPage),
              nextPageToken: data.nextPageToken,
              prevPageToken: data.prevPageToken,
              lastActivity: now.getTime()
            };
            VideoCounts.insert(videoCount);

            _.each(data.items, function (item, i) {
              var video = {
                videoId: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.default.url,
                url: "https://youtu.be/" + item.id.videoId,
                sessionId: options.sessionId,
                lastActivity: now.getTime()
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
