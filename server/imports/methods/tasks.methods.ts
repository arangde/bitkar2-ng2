/**
 * Created by jaran on 8/7/2016.
 */
import { Meteor } from 'meteor/meteor';
// import async from 'async';
import * as YoutubeSearch from "youtube-search";
import * as _ from 'underscore';

import { Products } from '../../../both/collections/products.collection';
import { ProductInfo } from '../../../both/collections/productinfo.collection';
import { ProductCounts } from '../../../both/collections/productcounts.collection';
import { AccessLogs } from '../collections/accesslogs.collection';
import { Videos } from '../../../both/collections/videos.collection';
import { VideoCounts } from '../../../both/collections/videocounts.collection';
import { Categories } from '../../../both/collections/categories.collection';
import { BaseItems } from '../../../both/collections/baseitems.collection';
import { BaseItemCounts } from '../../../both/collections/baseitemcounts.collection';
import { BaseVideos } from '../../../both/collections/basevideos.collection';
import { BaseVideoCounts } from '../../../both/collections/basevideocounts.collection';
import { Vendors } from '../../../both/collections/vendors.collection';

import AmazonApi from '../fixtures/amazon.api';
import EbayApi from '../fixtures/ebay.api';
import LocalFeedApi from '../fixtures/localfeed.api';

if(Meteor.isServer) {

  const amazonApi: AmazonApi = new AmazonApi();
  const ebayApi: EbayApi = new EbayApi();
  const localfeedApi: LocalFeedApi = new LocalFeedApi();

  Meteor.methods({
    'removeSessions': function () {
      var now = new Date();
      var endTime = now.getTime();
      var aDay = 24 * 60 * 60 * 1000; // a day with milliseconds
      endTime -= aDay;

      var counts = Products.remove({lastActivity: {$lt: endTime}});
      console.log(counts, "products removed");

      counts = ProductInfo.remove({lastActivity: {$lt: endTime}});
      console.log(counts, "products info removed");

      counts = ProductCounts.remove({lastActivity: {$lt: endTime}});
      console.log(counts, "products count removed");

      counts = AccessLogs.remove({lastActivity: {$lt: endTime - (aDay * 3)}});
      console.log(counts, "access logs removed");

      counts = Videos.remove({lastActivity: {$lt: endTime}});
      console.log(counts, "videos removed");

      counts = VideoCounts.remove({lastActivity: {$lt: endTime}});
      console.log(counts, "videos count removed");
    },
/*
    'updateVendors': function() {
      const pjVendors = [ "Auto Parts Warehouse", "JC Whitney" ];
      const cjVendors = [
        "4 Wheel Drive Hardware",
        "Advance Auto Parts",
        "AliExpress by Alibaba.com",
        "AutoBarn.com",
        "AutoZone",
        "Banggood CJ Affiliate Program",
        "BuyAutoParts.com",
        "Get All Parts",
        "Oscaro Online Auto Parts",
        "Sixity Powersports and Auto Parts",
        "eEuroparts.com"
      ];
      Vendors.find().forEach(function (vendor) {
        vendor.key = vendor.name.replace(/[^a-zA-Z]/g, " ").trim().replace(/ /g, "-").replace(/--/g, "-").toLowerCase();
        vendor.sortKey = vendor.label.replace(/[^a-zA-Z0-9]/g, " ").trim().replace(/ /g, "-").replace(/--/g, "-").toLowerCase();
        if(pjVendors.indexOf(vendor.name) !== -1) {
          vendor.feed = "pjfeed";
        }
        else if(cjVendors.indexOf(vendor.name) !== -1) {
          vendor.feed = "cjfeed";
        }
        else {
          vendor.feed = "";
        }
        Vendors.update({_id: vendor._id}, {"$set": {"key": vendor.key, "sortKey": vendor.sortKey, "feed": vendor.feed}}, {multi:false, upsert:false});
      });
    },

    'updateBaseItems': function() {
      const categories = Categories.find().fetch();
      const vendors = Vendors.find().fetch();
      BaseItems.remove({});

      // const vendors = [{
      //     "name" : "Get All Parts",
      //     "label" : "Get All Parts",
      //     "feed" : "cjfeed",
      //     "key" : "get-all-parts",
      //     "sortKey" : "get-all-parts"
      // },{
      //     "name" : "AutoZone",
      //     "label" : "AutoZone",
      //     "key" : "autozone",
      //     "feed" : "cjfeed",
      //     "sortKey" : "autozone"
      // },{
      //     "name" : "Sixity Powersports and Auto Parts",
      //     "label" : "Sixity Powersports and Auto Parts",
      //     "key" : "sixity-powersports-and-auto-parts",
      //     "feed" : "cjfeed",
      //     "sortKey" : "sixity-powersports-and-auto-parts"
      // }];
      // BaseItems.remove({"vendor": {"$in": ["get-all-parts", "autozone", "sixity-powersports-and-auto-parts"]}});

      async.eachSeries(categories, function (category, categoryCallback) {
        console.log("category", category.CategoryName);
        async.eachSeries(vendors, function (vendor, vendorCallback) {
          console.log("vendor", vendor.key);
          Meteor.setTimeout( function() {
            if( vendor.key == "ebay" ) {
              ebayApi.getCategoryItems(category.CategoryID, Meteor.bindEnvironment(function (err, products) {
                if (err) {
                  console.error('ebay', err);
                }
                else {
                  _.each(products, function (product) {
                    var product = ebayApi.getProduct(product);
                    product.categoryId = category.CategoryID;
                    BaseItems.insert(product);
                  });
                }
                vendorCallback(null, vendor);
              }));
            }
            else if( vendor.key == "amazon" ) {
              amazonApi.getItems([category.CategoryName], {itemPage: 1}, Meteor.bindEnvironment(function (amazonErr, amazonResult) {
                if (amazonErr) {
                  console.error('amazon', amazonErr);
                }
                else {
                  _.each(amazonResult.products, function (product) {
                    var product = amazonApi.getProduct(product);
                    product.categoryId = category.CategoryID;
                    BaseItems.insert(product);
                  });
                }
                vendorCallback(null, vendor);
              }));
            }
            else {
              if(vendor.feed == "cjfeed") {
                localfeedApi.searchCJItems([category.CategoryName], {vendorFilter: vendor.key}, Meteor.bindEnvironment(function (cjErr, cjResult) {
                  if (cjErr) {
                    console.error('cj feed', cjErr);
                  }
                  else {
                    _.each(cjResult.products, function(product, i) {
                      var product = localfeedApi.getCJProduct(product);
                      product.categoryId = category.CategoryID;
                      BaseItems.insert(product);
                    });
                  }
                  vendorCallback(null, vendor);
                }));
              }
              else if(vendor.feed == "pjfeed") {
                localfeedApi.searchPJItems([category.CategoryName], {vendorFilter: vendor.key}, Meteor.bindEnvironment(function (pjErr, pjResult) {
                  if (pjErr) {
                    console.error('pj feed', pjErr);
                  }
                  else {
                    _.each(pjResult.products, function (product, i) {
                      var product = localfeedApi.getPJProduct(product);
                      product.categoryId = category.CategoryID;
                      BaseItems.insert(product);
                    });
                  }
                  vendorCallback(null, vendor);
                }));
              }
            }
          }, 100);
        }, function(vendorErr) {
          console.log(category.CategoryName, "- has done");
          categoryCallback();
        });
      }, function(categoryErr) {
        console.log(BaseItems.find().count(), " has been inserted");
      });
    },

    'updateBaseItemCounts': function() {
      const categories = Categories.find().fetch();
      const vendors = Vendors.find().fetch();
      BaseItemCounts.remove({});

      // const vendors = [{
      //     "name" : "Get All Parts",
      //     "label" : "Get All Parts",
      //     "feed" : "cjfeed",
      //     "key" : "get-all-parts",
      //     "sortKey" : "get-all-parts"
      // },{
      //     "name" : "AutoZone",
      //     "label" : "AutoZone",
      //     "key" : "autozone",
      //     "feed" : "cjfeed",
      //     "sortKey" : "autozone"
      // },{
      //     "name" : "Sixity Powersports and Auto Parts",
      //     "label" : "Sixity Powersports and Auto Parts",
      //     "key" : "sixity-powersports-and-auto-parts",
      //     "feed" : "cjfeed",
      //     "sortKey" : "sixity-powersports-and-auto-parts"
      // }];
      // BaseItemCounts.remove({"vendor": {"$in": ["get-all-parts", "autozone", "sixity-powersports-and-auto-parts"]}});

      async.eachSeries(categories, function (category, categoryCallback) {
        console.log("category", category.CategoryName);
        async.eachSeries(vendors, function (vendor, vendorCallback) {
          console.log("vendor", vendor.key);
          Meteor.setTimeout( function() {
            if( vendor.key == "ebay" ) {
              ebayApi.getCategoryItems(category.CategoryID, Meteor.bindEnvironment(function (err, result) {
                if (err) {
                  console.error('ebay', err);
                }
                else {
                  BaseItemCounts.insert({
                    categoryId: category.CategoryID,
                    vendor: vendor.key,
                    total: result.total
                  });
                }
                vendorCallback(null, vendor);
              }));
            }
            else if( vendor.key == "amazon" ) {
              amazonApi.getItems([category.CategoryName], {itemPage: 1}, Meteor.bindEnvironment(function (amazonErr, amazonResult) {
                if (amazonErr) {
                  console.error('amazon', amazonErr);
                }
                else {
                  BaseItemCounts.insert({
                    categoryId: category.CategoryID,
                    vendor: vendor.key,
                    total: amazonResult.total
                  });
                }
                vendorCallback(null, vendor);
              }));
            }
            else {
              if(vendor.feed == "cjfeed") {
                localfeedApi.searchCJItems([category.CategoryName], {vendorFilter: vendor.key}, Meteor.bindEnvironment(function (cjErr, cjResult) {
                  if (cjErr) {
                    console.error('cj feed', cjErr);
                  }
                  else {
                    BaseItemCounts.insert({
                      categoryId: category.CategoryID,
                      vendor: vendor.key,
                      total: cjResult.total
                    });
                  }
                  vendorCallback(null, vendor);
                }));
              }
              else if(vendor.feed == "pjfeed") {
                localfeedApi.searchPJItems([category.CategoryName], {vendorFilter: vendor.key}, Meteor.bindEnvironment(function (pjErr, pjResult) {
                  if (pjErr) {
                    console.error('pj feed', pjErr);
                  }
                  else {
                    BaseItemCounts.insert({
                      categoryId: category.CategoryID,
                      vendor: vendor.key,
                      total: pjResult.total
                    });
                  }
                  vendorCallback(null, vendor);
                }));
              }
            }
          }, 100);
        }, function(vendorErr) {
          console.log(category.CategoryName, "- has done");
          categoryCallback();
        });
      }, function(categoryErr) {
        console.log(BaseItemCounts.find().count(), " has been inserted");
      });
    },

    'updateBaseVideos': function() {
      const categories = Categories.find().fetch();
      const vendors = Vendors.find().fetch();
      BaseVideos.remove({});
      BaseVideosCount.remove({});
      // const vendor = {
      //   "name" : "Get All Parts",
      //   "label" : "Get All Parts",
      //   "feed" : "cjfeed",
      //   "key" : "get-all-parts",
      //   "sortKey" : "get-all-parts"
      // };

      async.eachSeries(categories, function (category, categoryCallback) {
        console.log("category", category.CategoryName);
        // async.eachSeries(vendors, function (vendor, vendorCallback) {
        //     console.log("vendor", vendor.key);
        Meteor.setTimeout( function() {
          var now = new Date();

          var searchOptions = {
            part: "snippet",
            publishedAfter: (now.getFullYear() - 3) + "-01-01T00:00:00Z",
            videoCaption: "closedCaption",
            type: "video",
            maxResults: 6,
            q: category.CategoryName + ' ' + vendor.name,
            videoCategoryId: "2",
            regionCode: "US",
            order: 'relevance'
          };

          YoutubeSearch(searchOptions, Meteor.bindEnvironment(function (err, data) {
            BaseVideos.remove({"categoryId": category.CategoryID, "vendor": vendor.key});
            BaseVideosCount.remove({"categoryId": category.CategoryID, "vendor": vendor.key});

            if(err) {
              console.error(err);
            }
            else {
              if (Match.test(data.items, Match.Any) && data.items != undefined) {
                var videoCount = {
                  totalResults: data.pageInfo.totalResults,
                  resultsPerPage: data.pageInfo.resultsPerPage,
                  totalPages: Math.ceil(data.pageInfo.totalResults / data.pageInfo.resultsPerPage),
                  nextPageToken: data.nextPageToken,
                  prevPageToken: data.prevPageToken,
                  categoryId: category.CategoryID,
                  vendor: vendor.key
                };
                BaseVideosCount.insert(videoCount);

                _.each(data.items, function (item, i) {
                  var video = {
                    videoId: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.default.url,
                    url: "https://youtu.be/" + item.id.videoId,
                    publishedAt: item.snippet.publishedAt,
                    categoryId: category.CategoryID,
                    vendor: vendor.key
                  };
                  BaseVideos.insert(video);
                });
              }
              else {
                console.error("youtube could not search with keywords");
              }
            }

            // console.log(vendor.key, "- has done");
            // vendorCallback();
            categoryCallback();
          }));
        }, 100);
        // }, function(vendorErr) {
        //     console.log(category.CategoryName, "- has done");
        //     categoryCallback();
        // });
      }, function(categoryErr) {
        console.log(BaseVideos.find().count(), BaseVideosCount.find().count(), " has been inserted");
      });
    }
*/
  });
}