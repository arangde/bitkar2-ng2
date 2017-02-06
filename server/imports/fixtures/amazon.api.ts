/**
 * Created by jaran on 8/28/2016.
 */
import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import * as amazon from 'amazon-product-api';
import { getVendorKey } from '../../../both/collections/vendors.collection';
import { getSEOUrl, replacePropertyKey, getValueOfKey } from '../../../both/methods/utils';

const amazonSettings = Meteor.settings['amazon'];
const amazonClient = amazon.createClient({
  awsId: amazonSettings.AWSAccessKeyId,
  awsSecret: amazonSettings.SecretAccessKey,
  awsTag: amazonSettings.AssociateTag
});

class AmazonApi {

  getPrice(json) {
    if (getValueOfKey(json, ["Offers", 0, "Offer", 0, "OfferListing", 0, "Price", 0])) {
      var price = getValueOfKey(json, ["Offers", 0, "Offer", 0, "OfferListing", 0, "Price", 0]);
      return [getValueOfKey(price, ["Amount", 0]) / 100, getValueOfKey(price, ["FormattedPrice", 0])];
    }
    else {
      return [0, ""];
    }
  }

  getProduct(json, onlyWithImage = false) {
    var json = replacePropertyKey(json);
    var product = {};
    var params = ["ASIN", "DetailPageURL", "SmallImage", "MediumImage", "LargeImage", "ItemAttributes"];
    for (var i = 0; i < params.length; i++) {
      if (Match.test(json[params[i]], Match.Any) && json[params[i]] != undefined) {
        product[params[i]] = json[params[i]][0];
      }
    }

    var attrs = product['ItemAttributes'];
    var image = product['MediumImage'] || product['SmallImage'] || product['LargeImage'];

    if (onlyWithImage) {
      if (!image || image == undefined) {
        return null;
      }
    }

    var amazonProduct = {
      itemId: product['ASIN'],
      viewItemURL: product['DetailPageURL'],
      galleryURL: (!image || image == undefined) ? "/images/nopicture.png" : image.URL[0],
      title: attrs.Title[0],
      subtitle: getValueOfKey(attrs, ["Brand", 0]),
      seoURL: getSEOUrl(attrs.Title[0]),
      vendor: getVendorKey("Amazon")
    };


    var price = this.getPrice(json);
    amazonProduct['price'] = price[0];
    amazonProduct['priceFormatted'] = price[1];

    return amazonProduct;
  }

  getTopProduct(json) {
    var amazonProduct = this.getProduct(json, true);

    if (!amazonProduct)
      return null;

    var json = replacePropertyKey(json);

    amazonProduct['rank'] = json["SalesRank"] != undefined ? json["SalesRank"][0] : 0;
    amazonProduct['imageURL'] = amazonProduct.galleryURL;
    delete amazonProduct.galleryURL;
    amazonProduct['price'] = amazonProduct['priceFormatted'];
    delete amazonProduct['priceFormatted'];

    return amazonProduct;
  }

  getProductDetail(json) {
    var json = replacePropertyKey(json[0]);

    var product = {};
    var params = ["ASIN", "DetailPageURL", "SmallImage", "MediumImage", "LargeImage", "ItemAttributes"];
    for (var i = 0; i < params.length; i++) {
      if (Match.test(json[params[i]], Match.Any) && json[params[i]] != undefined) {
        product[params[i]] = json[params[i]][0];
      }
    }

    var attrs = product['ItemAttributes'];
    var image = product['MediumImage'] || product['SmallImage'] || product['LargeImage'];

    var amazonProduct = {
      itemId: product['ASIN'],
      viewItemURL: product['DetailPageURL'],
      galleryURL: (!image || image == undefined) ? "/images/nopicture.png" : image.URL[0],
      categoryName: getValueOfKey(attrs, ["ProductGroup", 0]),
      title: attrs.Title[0],
      subtitle: "",
      seoURL: getSEOUrl(attrs.Title[0]),
      description: attrs.Feature ? attrs.Feature.join("<br />") : "",
      quantity: getValueOfKey(attrs, ["PackageQuantity", 0]),
      UPC: getValueOfKey(attrs, ["UPC", 0]),
      EAN: getValueOfKey(attrs, ["EAN", 0]),
      SKU: getValueOfKey(attrs, ["SKU", 0]),
      ISBN: getValueOfKey(attrs, ["ISBN", 0]),
      attributes: {
        Brand: getValueOfKey(attrs, ["Brand", 0])
      },
      vendor: getVendorKey("Amazon")
    };

    var price = this.getPrice(json);
    amazonProduct['price'] = price[0];
    amazonProduct['priceFormatted'] = price[1];

    if (attrs.ItemDimensions && attrs.ItemDimensions != undefined) {
      var dimensions = attrs.ItemDimensions[0];
      var dimension = dimensions.Model;
      if (dimension != undefined) {
        amazonProduct.attributes['Model'] = dimension[0];
      }

      var dimension = dimensions.Height;
      if (dimension != undefined) {
        amazonProduct.attributes['Height'] = dimension[0]._ + ' ' + dimension[0]._prop.Units;
      }

      dimension = dimensions.Width;
      if (dimension != undefined) {
        amazonProduct.attributes['Width'] = dimension[0]._ + ' ' + dimension[0]._prop.Units;
      }

      dimension = dimensions.Weight;
      if (dimension != undefined) {
        amazonProduct.attributes['Weight'] = dimension[0]._ + ' ' + dimension[0]._prop.Units;
      }

      dimension = dimensions.Length;
      if (dimension != undefined) {
        amazonProduct.attributes['Length'] = dimension[0]._ + ' ' + dimension[0]._prop.Units;
      }
    }

    return amazonProduct;
  }

  getItems(keywords, options, callback) {
    keywords = keywords.join(" ").trim();

    var params = {
      keywords: keywords,
      browseNode: amazonSettings.baseNodeId, //Auto Parts
      searchIndex: 'Automotive',
      itemPage: options.itemPage,
      responseGroup: 'ItemAttributes,Images,Offers'
    };

    if (options['priceSort'] && options['priceSort'] == 1) {
      params['sort'] = "price";
    }
    else if (options['priceSort'] && options['priceSort'] == 2) {
      params['sort'] = "-price";
    }

    console.log('amazon params', params);

    amazonClient.itemSearch(params, (err, products, response) => {
      if (err) {
        callback(err);
      } else {
        const result = {
          products: products,
          total: {
            totalEntries: response[0].TotalResults[0],
            totalPages: response[0].TotalPages[0],
            pageNumber: options.itemPage,
          }
        };
        callback(null, result);
      }
    });
  }

  getItemsByKeywords(keywords, callback) {
    keywords = keywords.join(" ").trim();
    if (keywords == "") {
      keywords = "Auto Parts";
    }

    var params = {
      keywords: keywords,
      searchIndex: 'Automotive',
      browseNode: amazonSettings.baseNodeId,
      responseGroup: 'ItemAttributes'
    };

    amazonClient.itemSearch(params, (err, products) => {
      if (err) {
        callback(err);
      } else {
        callback(null, products);
      }
    });
  }

  getTopProducts(callback) {
    var params = {
      browseNode: amazonSettings.baseNodeId, //Auto Parts
      searchIndex: 'Automotive',
      sort: 'salesrank',
      responseGroup: 'ItemAttributes,Images,Offers,SalesRank'
    };

    amazonClient.itemSearch(params, (err, products) => {
      if (err) {
        callback(err);
      } else {
        callback(null, products);
      }
    });
  }

  getItem(itemId, callback) {
    amazonClient.itemLookup({
        Condition: 'All',
        IdType: 'ASIN',
        ItemId: itemId,
        searchIndex: 'Automotive',
        ResponseGroup: 'ItemAttributes,Images,Offers'
      },
      function (err, product) {
        if (err) {
          callback(err);
        } else {
          callback(null, product);
        }
      }
    );
  }
};

export default AmazonApi;