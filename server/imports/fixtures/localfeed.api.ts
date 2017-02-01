/**
 * Created by jaran on 8/28/2016.
 */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { getVendorKey, getVendorName } from '../../../both/collections/vendors.collection';
import { getSEOUrl } from './utils';
import { CJFeeds, PJFeeds } from '../collections/localfeeds.collection';

class LocalFeedApi {
  
  limitPerPage: number = Meteor.settings['public']['apiPerPage'];

  formatPJData(data) {
    var spaces = data.replace("_", " ");
    var periods = spaces.replace("-dot-", ".");
    var commas = periods.replace("-comma-", ",");
    var paragraph = commas.replace("<p>", ". ");
    var tags = paragraph.replace("<*>", "");

    return tags;
  }

  getCJProduct(product) {
    var cjProduct = {
      itemId: product._id.valueOf(),
      viewItemURL: product.BUYURL,
      galleryURL: (product.IMAGEURL=="" || product.IMAGEURL == undefined)? "/images/nopicture.png": product.IMAGEURL,
      title: product.NAME,
      subtitle: product.MANUFACTURER,
      seoURL: getSEOUrl(product.NAME),
      vendor: getVendorKey(product.PROGRAMNAME)
    };

    cjProduct['price'] = product.PRICE;
    cjProduct['priceFormatted'] = '$' + product.PRICE;

    return cjProduct;
  }

  getPJProduct(product) {
    var pjProduct = {
      itemId: product._id.valueOf(),
      viewItemURL: product.buy_url,
      galleryURL: (product.image_url=="" || product.image_url == undefined)? "/images/nopicture.png": product.image_url,
      title: product.name,
      subtitle: this.formatPJData(product.description_short),
      seoURL: getSEOUrl(product.name),
      vendor: getVendorKey(product.program_name)
    };

    pjProduct['price'] = product.price;

    return pjProduct;
  }

  getCJProductDetail(product) {
    var cjProduct = {
      itemId: product._id.valueOf(),
      viewItemURL: product.BUYURL,
      galleryURL: (product.IMAGEURL=="" || product.IMAGEURL==undefined)? "/images/nopicture.png": product.IMAGEURL,
      categoryName: product.ADVERTISERCATEGORY,
      title: product.NAME,
      subtitle: product.MANUFACTURER,
      seoURL: getSEOUrl(product.NAME),
      description: product.DESCRIPTION,
      quantity: "1+",
      UPC: product.UPC,
      EAN: "N/A",
      SKU: product.SKU,
      ISBN : product.ISBN,
      attributes: {
        Brand: product.MANUFACTURER
      },
      vendor: getVendorKey(product.PROGRAMNAME)
    };

    cjProduct['price'] = product.PRICE;
    cjProduct['priceFormatted'] = '$' + product.PRICE;

    return cjProduct;
  }

  getPJProductDetail(product) {
    var pjProduct = {
      itemId: product._id.valueOf(),
      viewItemURL: product.buy_url,
      galleryURL: (product.image_url=="" || product.image_url == undefined)? "/images/nopicture.png": product.image_url,
      categoryName: product.category_program,
      title: product.name,
      subtitle: this.formatPJData(product.description_short),
      seoURL: getSEOUrl(product.name),
      description: this.formatPJData(product.description_long),
      quantity: "1+",
      UPC: product.upc,
      EAN: "N/A",
      SKU: product.sku,
      ISBN : product.isbn,
      attributes: {
        Brand: product.manufacturer
      },
      vendor: getVendorKey(product.program_name)
    };

    pjProduct['price'] = product.price;

    return pjProduct;

  }

  searchCJItems(keywords, options, callback) {
    var searchText = keywords.join(" ").trim();

    var filters = {};
    if(options.vendorFilter != "") {
      filters['PROGRAMNAME'] = getVendorName(options.vendorFilter);
    }

    var searchOptions = {
      limit: this.limitPerPage,
      skip: (options.page - 1) * this.limitPerPage
    };

    if(searchText !== "") {
      filters["$text"] = { $search : searchText };
      searchOptions['fields'] = {score : { $meta: "textScore" }};
      searchOptions['sort'] = {score : { $meta: "textScore" }};
    }

    const total = CJFeeds.find(filters).count();
    const items = CJFeeds.find( filters, searchOptions).fetch();

    if (!items || !items.length) {
      callback(new Error("cj feed items not found"));
    } else {
      var result = {
        products: items,
        total: {
          totalEntries: total,
          totalPages: Math.ceil(total / this.limitPerPage),
          pageNumber: options.page,
        }
      };
      callback(null, result);
    }
  }

  searchPJItems(keywords, options, callback) {
    var searchText = keywords.join(" ").trim();

    var filters = {};
    if(options.vendorFilter != "") {
      filters['program_name'] = getVendorName(options.vendorFilter);
    }

    var searchOptions = {
      limit: this.limitPerPage,
      skip: (options.page - 1) * this.limitPerPage
    };

    if(searchText !== "") {
      filters["$text"] = { $search : searchText };
      searchOptions['fields'] = {score : { $meta: "textScore" }};
      searchOptions['sort'] = {score : { $meta: "textScore" }};
    }

    const total = PJFeeds.find(filters).count();
    const items = PJFeeds.find( filters, searchOptions).fetch();

    if (!items || !items.length) {
      callback(new Error("pj feed items not found"));
    } else {
      var result = {
        products: items,
        total: {
          totalEntries: total,
          totalPages: Math.ceil(total/this.limitPerPage),
          pageNumber: options.page,
        }
      };
      callback(null, result);
    }
  }

  getCJItem(itemId, callback) {
    const productId = new Mongo.ObjectID(itemId);

    const product = CJFeeds.findOne({"_id": productId});

    if(!product) {
      callback(new Error("No CJ item found for " + itemId));
    } else {
      callback(null, product);
    }
  }

  getPJItem(itemId, callback) {
    const productId = new Mongo.ObjectID(itemId);

    const product = PJFeeds.findOne({"_id": productId});

    if(!product) {
      callback(new Error("No PJ item found for " + itemId));
    } else {
      callback(null, product);
    }
  }
};

export default LocalFeedApi;