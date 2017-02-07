/**
 * Created by jaran on 7/9/2016.
 */
import { Meteor } from 'meteor/meteor';
import logger from 'winston';
import * as _ from 'underscore';
import { Products } from '../../../both/collections/products.collection';
import { ProductInfo } from '../../../both/collections/productinfo.collection';
import { GlobalParts } from '../../../both/collections/globalparts.collection';
import { ProductCounts } from '../../../both/collections/productcounts.collection';
import { getVendorKey, getVendorFeed } from '../../../both/collections/vendors.collection';
import AmazonApi from '../fixtures/amazon.api';
import EbayApi from '../fixtures/ebay.api';
import LocalFeedApi from '../fixtures/localfeed.api';

if(Meteor.isServer) {
  const apiPerPage = Meteor.settings['public']['apiPerPage'];
  const amazonApi: AmazonApi = new AmazonApi();
  const ebayApi: EbayApi = new EbayApi();
  const localfeedApi: LocalFeedApi = new LocalFeedApi();

  const findAmazonItemsByPage = function(keywords, itemPage, options, now) {
    return new Promise((resolve, reject) => {
      amazonApi.getItems(keywords, {itemPage: itemPage}, (err, amazonResult) => {
        if (err) {
          reject(err);
        }
        else {
          _.each(amazonResult.products, function (product) {
            let formattedProduct = amazonApi.getProduct(product);

            formattedProduct['sessionId'] = options.sessionId;
            formattedProduct['lastActivity'] = now.getTime();
            Products.collection.insert(formattedProduct);
          });

          resolve(amazonResult.total);
        }
      });
    });
  };

  Meteor.methods({
    'findProducts': function (filters, options) {
      const keywords = [];

      if(options.partId != undefined) {
        const part = GlobalParts.collection.findOne({"PartId": options.partId});
        if(part) {
          keywords.push(part.PartName);
        }
      }

      _.forEach(filters, function (value, key) {
        if (value != "") {
          keywords.push(value);
        }
      });

      const now = new Date();

      if(options.reload) {
        Products.collection.remove({sessionId: options.sessionId});
      }

      console.log(filters, options);

      Promise.all([
        function _findEbay() {
          return new Promise((resolve) => {
            if(options.vendorFilter == "" || options.vendorFilter == getVendorKey("Ebay")) {
              if(options.reload) {
                options.ebayPage = 1;
              }
              else {
                const ebayCount = ProductCounts.collection.findOne({
                  sessionId: options.sessionId,
                  vendor: getVendorKey("Ebay")
                });
                options.ebayPage = (ebayCount == undefined) ? 1 : parseInt(ebayCount.total.pageNumber) + 1;
              }
              console.log("ebayPage", options.ebayPage);

              ProductCounts.remove({sessionId: options.sessionId, vendor: getVendorKey("Ebay")});
              ebayApi.getItemsAdvanced(keywords, options, (err, findResult) => {
                if (err) {
                  console.error('ebay', err);
                  ProductCounts.insert({
                    sessionId: options.sessionId,
                    vendor: getVendorKey("Ebay"),
                    total: {totalEntries:0, pageNumber:0},
                    lastActivity: now.getTime()
                  });
                }
                else {
                  ProductCounts.insert({
                    sessionId: options.sessionId,
                    vendor: getVendorKey("Ebay"),
                    total: findResult.total,
                    lastActivity: now.getTime()
                  });

                  _.each(findResult.products, function (product, i) {
                    let formattedProduct = ebayApi.getProduct(product);

                    formattedProduct['sessionId'] = options.sessionId;
                    formattedProduct['lastActivity'] = now.getTime();
                    Products.collection.insert(formattedProduct);
                  });
                }
                resolve('ebay');
              });
            }
            else {
              resolve('ebay');
            }
          });
        },
        function _findAmazon() {
          return new Promise((resolve) => {
            if(options.vendorFilter == "" || options.vendorFilter == getVendorKey("Amazon")) {
              if(options.reload) {
                options.amazonPage = 1;
              }
              else {
                const amazonCount = ProductCounts.findOne({
                  sessionId: options.sessionId,
                  vendor: getVendorKey("Amazon")
                });
                options.amazonPage = (amazonCount == undefined) ? 1 : parseInt(amazonCount.total.pageNumber) + 1;
              }

              if(options.amazonPage <= 10) {
                console.log("amazonPage", options.amazonPage);

                const itemPages = [];
                for (let i = 0; i < apiPerPage / 10; i++) {
                  itemPages.push(options.amazonPage + i);
                }

                ProductCounts.remove({sessionId: options.sessionId, vendor: getVendorKey("Amazon")});
                let totalProducts = null;

                findAmazonItemsByPage(keywords, itemPages[0], options, now).then((res) => {
                  console.log('Amazon page 1 done');
                  totalProducts = res;
                  return findAmazonItemsByPage(keywords, itemPages[1], options, now);
                }).then((res) => {
                  totalProducts = res;
                  console.log('Amazon page 2 done');
                }).catch((err) => {
                  logger.error('amazon', err);
                }).then((res) => {
                  console.log('Amazon final');

                  if(!totalProducts) {
                    totalProducts = {totalEntries:0, pageNumber:0};
                  }

                  ProductCounts.insert({
                    sessionId: options.sessionId,
                    vendor: getVendorKey("Amazon"),
                    total: totalProducts,
                    lastActivity: now.getTime()
                  });

                  resolve('amazon');
                });
              }
              else {
                resolve('amazon');
              }
            }
          });
        },
        function _findLocal() {
          return new Promise((resolve) => {
            if(options.vendorFilter != getVendorKey("Ebay") && options.vendorFilter != getVendorKey("Amazon")) {
              if(options.reload) {
                options.page = 1;
              }
              else {
                const feedCount = ProductCounts.findOne({
                  sessionId: options.sessionId,
                  vendor: options.vendorFilter
                });
                options.page = (feedCount == undefined) ? 1 : parseInt(feedCount.total.pageNumber) + 1;
              }
              console.log("Feed page " + options.vendorFilter, options.page);

              const feed = getVendorFeed(options.vendorFilter);

              Promise.all([
                function _findCJFeed() {
                  return new Promise((resolveCJ) => {
                    if(feed == "" || feed == "cjfeed") {
                      ProductCounts.remove({sessionId: options.sessionId, feed: "cjfeed", vendor: options.vendorFilter});
                      localfeedApi.searchCJItems(keywords, options, (cjErr, cjResult) => {
                        if (cjErr) {
                          console.error('cj feed', cjErr);
                          ProductCounts.insert({
                            sessionId: options.sessionId,
                            vendor: options.vendorFilter,
                            feed: "cjfeed",
                            total: {totalEntries:0, pageNumber:0},
                            lastActivity: now.getTime()
                          });
                        }
                        else {
                          ProductCounts.insert({
                            sessionId : options.sessionId,
                            vendor: options.vendorFilter,
                            feed: "cjfeed",
                            total: cjResult.total,
                            lastActivity: now.getTime()
                          });

                          console.log('search CJItems', cjResult.products.length);
                          _.each(cjResult.products, function(product, i) {
                            let formattedProduct = localfeedApi.getCJProduct(product);

                            // var baseItem = formattedProduct;
                            // BaseItems.insert(baseItem);

                            formattedProduct['sessionId'] = options.sessionId;
                            Products.collection.insert(formattedProduct);
                          });
                        }
                        resolveCJ('local cj');
                      });
                    }
                    else {
                      resolveCJ('local cj');
                    }
                  });
                },
                function _findPJFeed() {
                  return new Promise((resolvePJ) => {
                    if(feed == "" || feed == "pjfeed") {
                      ProductCounts.remove({sessionId: options.sessionId, feed: "pjfeed", vendor: options.vendorFilter});
                      localfeedApi.searchPJItems(keywords, options, (pjErr, pjResult) => {
                        if (pjErr) {
                          console.error('pj feed', pjErr);
                          ProductCounts.insert({
                            sessionId: options.sessionId,
                            vendor: options.vendorFilter,
                            feed: "pjfeed",
                            total: {totalEntries:0, pageNumber:0},
                            lastActivity: now.getTime()
                          });
                        }
                        else {
                          ProductCounts.insert({
                            sessionId : options.sessionId,
                            vendor: options.vendorFilter,
                            feed: "pjfeed",
                            total: pjResult.total,
                            lastActivity: now.getTime()
                          });

                          console.log('search PJItems', pjResult.products.length);
                          _.each(pjResult.products, function (product, i) {
                            let formattedProduct = localfeedApi.getPJProduct(product);

                            // var baseItem = formattedProduct;
                            // BaseItems.insert(baseItem);

                            formattedProduct['sessionId'] = options.sessionId;
                            Products.collection.insert(formattedProduct);
                          });
                        }
                        resolvePJ('local pj');
                      });
                    }
                    else {
                      resolvePJ('local pj');
                    }
                  });
                }
              ]).then((res) => {
                console.log('local', res);
                resolve('local');
              });
            }
            else {
              resolve('local');
            }
          });
        }
      ]).then((res) => {
        console.log('findProducts', res);
      });
    },

    'getProductInfo': function (itemId, vendor, sessionId) {
      const now = new Date();

      ProductInfo.remove({sessionId: sessionId});

      console.log('get ItemInfo', vendor, 'ItemId', itemId);

      if(vendor == 'ebay') {
        ebayApi.getItem(itemId, (err, item) => {
          if (err) {
            logger.error(err);
          }
          else {
            let productInfo = ebayApi.getProductDetail(item);
            productInfo['sessionId'] = sessionId;
            productInfo['lastActivity'] = now.getTime();
            ProductInfo.insert(productInfo);
          }
        });
      }
      else if (vendor == 'amazon') {
        amazonApi.getItem(itemId, (err, item) => {
          if (err) {
            logger.error(err);
          }
          else {
            let productInfo = amazonApi.getProductDetail(item);
            productInfo['sessionId'] = sessionId;
            productInfo['lastActivity'] = now.getTime();
            ProductInfo.insert(productInfo);
          }
        });
      }
      else {
        const feed = getVendorFeed(vendor);

        console.log('feed', feed);

        if(feed == "cjfeed") {
          localfeedApi.getCJItem(itemId, (err, item) => {
            if (err) {
              logger.error(err);
            }
            else {
              let productInfo = localfeedApi.getCJProductDetail(item);
              productInfo['sessionId'] = sessionId;
              productInfo['lastActivity'] = now.getTime();
              ProductInfo.insert(productInfo);
            }
          });
        }
        else if(feed == "pjfeed") {
          localfeedApi.getPJItem(itemId, (pjErr, item) => {
            if (pjErr) {
              logger.error(pjErr);
            }
            else {
              let productInfo = localfeedApi.getPJProductDetail(item);
              productInfo['sessionId'] = sessionId;
              productInfo['lastActivity'] = now.getTime();
              ProductInfo.insert(productInfo);
            }
          });
        }
      }
    },

    'findTopProducts': function() {
      // async.series([
      //   function(callback) {
      //     ebayApi.getTopProducts(Meteor.bindEnvironment(function(err, products) {
      //       if(err) {
      //         console.error(err);
      //       }
      //       else {
      //         TopProducts.remove({vendor: getVendorKey("Ebay")});
      //         _.each(products, function (product) {
      //           var product = ebayApi.getTopProduct(product);
      //           TopProducts.insert(product);
      //         });
     
      //         console.log("get EbayTopProducts", products.length);
      //       }
      //     }));
      //     callback();
      //   },
      //   function(callback) {
      //     amazonApi.getTopProducts(Meteor.bindEnvironment(function(err, products) {
      //       if(err) {
      //         console.error(err);
      //       }
      //       else {
      //         TopProducts.remove({vendor: getVendorKey("Amazon")});
      //         var topCount = 0;
      //         _.each(products, function (product) {
      //           var product = amazonApi.getTopProduct(product);
      //           if(product) {
      //             TopProducts.insert(product);
      //             topCount++;
      //           }
      //         });
     
      //         console.log("get AmazonTopProducts", topCount);
      //       }
      //     }));
      //     callback();
      //   }
      // ]);
    }
  });
}