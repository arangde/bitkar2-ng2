// import async from 'meteor/meteorhacks:async';

import { Categories } from '../../../both/collections/categories.collection';

var cachedCategoryIds = [];

function getChildCategories(categoryId) {
  return Categories.collection.find({'CategoryParentID': categoryId}).fetch();
};

function loadCategory(categoryId) {
  categoryId = categoryId.toString();

  const category = Categories.collection.findOne({'CategoryID': categoryId});

  if (!category) {
    throw new Error("Not found category");
  }
  else {
    cachedCategoryIds.push(categoryId);

    const children = getChildCategories(categoryId);
    children.forEach((child) => {
      if(cachedCategoryIds.indexOf(child.CategoryID) === -1) {
        if (child.LeafCategory) {
          cachedCategoryIds.push(child.CategoryID);
        }
        else {
          loadCategory(child.CategoryID);
        }
      }
    });
  }
};

export function getCategoryIds(categoryId) {
  cachedCategoryIds = [];
  loadCategory(categoryId);

  return cachedCategoryIds;
};
