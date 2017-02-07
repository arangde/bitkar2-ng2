import { Meteor } from 'meteor/meteor';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { PaginationService } from "ng2-pagination";
import { MeteorObservable } from "meteor-rxjs";
import { Counts } from "meteor/tmeasday:publish-counts";
import * as _ from 'underscore';

import { SessionService } from '../shared/session.service';
import { Brand } from "../../../../both/models/brand.model";
import { Brands } from "../../../../both/collections/brands.collection";
import { Category } from "../../../../both/models/category.model";
import { Categories } from "../../../../both/collections/categories.collection";
import { Product } from "../../../../both/models/product.model";
import { Products } from "../../../../both/collections/products.collection";
import { BaseItems } from "../../../../both/collections/baseitems.collection";
import { BaseItemCounts } from "../../../../both/collections/baseitemcounts.collection";
import { Make } from "../../../../both/models/make.model";
import { Makes } from "../../../../both/collections/makes.collection";
import { Vehicle } from '../../../../both/models/vehicle.model';
import { Vehicles } from "../../../../both/collections/vehicles.collection";
import { Engine } from '../../../../both/models/engine.model';
import { Engines } from "../../../../both/collections/engines.collection";
import { GlobalPart } from '../../../../both/models/globalpart.model';
import { GlobalParts } from "../../../../both/collections/globalparts.collection";
import { Vendor } from '../../../../both/models/vendor.model';
import { Vendors } from "../../../../both/collections/vendors.collection";
import { getEngineDisplay } from "../../../../both/methods/utils";

import template from './products-list.component.html';
import style from '../less/products-list.less';

interface Pagination {
  limit: number;
  skip: number;
}

interface Options extends Pagination {
  [key: string]: any
}

@Component({
  selector: 'products-list',
  template,
  styles: [ style ]
})
export class ProductsListComponent implements OnInit, OnDestroy {
  sessionId: string;
  searching: boolean = false;
  searchFailed: boolean = false;
  showCounter: boolean = true;
  baseVideoSearch: boolean = true;
  searchText: string = '';
  years: number[];
  year: number = 0;
  make: string = '';
  model: string = '';
  engine: string = '';
  categoryId: string = '';
  categoryName: string = '';
  brandName: string = '';
  priceSort: string = '';
  vendor: string = '';

  curPage: Subject<number> = new Subject<number>();
  curCategory: Subject<string> = new Subject<string>();
  curPriceSort: Subject<string> = new Subject<string>();
  curVendor: Subject<string> = new Subject<string>();
  baseSearch: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  productsCountStart: number = 0;
  pageSize: number = 20; // Meteor.settings['public']['pageSize'];

  optionsSub: Subscription;
  autorunSub: Subscription;
  brands: Observable<Brand[]>;
  brandsSub: Subscription;
  categories: Observable<Category[]>;
  categoriesSub: Subscription;
  products: Observable<Product[]>;
  productsSub: Subscription;
  productsCount: number = 0;
  baseItemsSub: Subscription;
  baseItemCountsSub: Subscription;
  vehicles: Observable<Vehicle[]>;
  vehiclesSub: Subscription;
  makes: Observable<Make[]>;
  makesSub: Subscription;
  models: Observable<string[]>;
  engines: Observable<string[]>;
  enginesSub: Subscription;
  vendors: Observable<Vendor[]>;
  vendorsSub: Subscription;
  
  constructor(private session: SessionService, private pagination: PaginationService) {
    this.sessionId = this.session.id();

    const years: number[] = [];
    const maxYear:number = (new Date()).getFullYear() + 1;

    for(let i=1980; i<=maxYear; i++) {
      years.push(i);
    }
    this.years = years;
  }

  ngOnInit() {
    this.optionsSub = Observable.combineLatest(
      this.curPage,
      this.baseSearch,
      this.curCategory,
      this.curPriceSort,
      this.curVendor
    ).subscribe(([curPage, baseSearch, curCategory, curPriceSort, curVendor]) => {
      console.log(curPage, baseSearch, curCategory, curPriceSort, curVendor);
      if(baseSearch) {
        if (this.baseItemsSub) {
          this.baseItemsSub.unsubscribe();
        }

        const filter = {
          categoryId: curCategory,
          vendor: curVendor,
          limit: this.pageSize
        };

        this.baseItemsSub = MeteorObservable.subscribe('baseitems', filter).subscribe(() => {
          this.products = BaseItems.find({}).zone();
        });

        if (this.baseItemCountsSub) {
          this.baseItemCountsSub.unsubscribe();
        }

        this.baseItemCountsSub = MeteorObservable.subscribe('baseitemcounts', filter).subscribe(() => {
          let productsCount = 0;
          const baseItemCounts = BaseItemCounts.collection.find({}).fetch();

          baseItemCounts.forEach((itemCount) => {
            if (itemCount.vendor == 'amazon') {
              productsCount += parseInt(itemCount.total.totalPages) * 10;
            }
            else {
              productsCount += parseInt(itemCount.total.totalEntries);
            }
          });
          this.productsCount = productsCount;
        });
      }
      else {
        this.pagination.setCurrentPage(this.pagination.defaultId, curPage as number);

        if (this.productsSub) {
          this.productsSub.unsubscribe();
        }

        const options: Options = {
          limit: this.pageSize,
          skip: ((curPage as number) - 1) * this.pageSize
        };
        const filter = {
          priceSort: curPriceSort,
          vendorFilter: curVendor,
          page: curPage as number,
          sessionId: this.sessionId
        };

        this.productsSub = MeteorObservable.subscribe('products', options, filter).subscribe(() => {
          this.products = Products.find({}).zone();
        });
      }
    });

    this.pagination.register({
      id: this.pagination.defaultId,
      itemsPerPage: this.pageSize,
      currentPage: 1,
      totalItems: this.productsCount
    });

    this.curPage.next(1);
    this.baseSearch.next(true);
    this.curCategory.next(this.categoryId);
    this.curPriceSort.next(this.priceSort);
    this.curVendor.next(this.vendor);

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.productsCount = Counts.get('numberOfProducts');
      this.pagination.setTotalItems(this.pagination.defaultId, this.productsCount);
    });

    if(this.brandsSub) {
      this.brandsSub.unsubscribe();
    }
    this.brandsSub = MeteorObservable.subscribe('brands').subscribe(() => {
      this.brands = Brands.find({}).zone();
    });

    if(this.categoriesSub) {
      this.categoriesSub.unsubscribe();
    }
    this.categoriesSub = MeteorObservable.subscribe('categories').subscribe(() => {
      this.categories = Categories.find({}).zone();
    });

    if(this.makesSub) {
      this.makesSub.unsubscribe();
    }
    this.makesSub = MeteorObservable.subscribe('makes').subscribe(() => {
      this.makes = Makes.find({}, {sort: {'MakeName': 1}}).zone();
    });

    if(this.vendorsSub) {
      this.vendorsSub.unsubscribe();
    }
    this.vendorsSub = MeteorObservable.subscribe('vendors').subscribe(() => {
      this.vendors = Vendors.find({}).zone();
    });
  }

  ngOnDestroy() {
    this.optionsSub.unsubscribe();
    this.brandsSub.unsubscribe();
    this.categoriesSub.unsubscribe();
    this.baseItemsSub.unsubscribe();
    this.productsSub.unsubscribe();
    this.autorunSub.unsubscribe();
    this.makesSub.unsubscribe();
    this.vehiclesSub.unsubscribe();
    this.enginesSub.unsubscribe();
    this.vendorsSub.unsubscribe();
  }

  // onPageChanged(page: number): void {
  //   this.curPage.next(page);
  // }
  //
  // changeSortOrder(nameOrder: string): void {
  //   this.nameOrder.next(parseInt(nameOrder));
  // }

  onCategoryChanged(category, $event) {
    if(category) {
      this.categoryId = category.CategoryID;
      this.categoryName = category.CategoryName;
    }
    else {
      this.categoryId = '';
      this.categoryName = '';
    }

    document.querySelector("ul.category-filter>li.active").classList.remove("active");
    $event.target.classList.add("active");

    this.curCategory.next(this.categoryId);

    this.getSearchText();
    this.search();
  }

  onBrandChanged(brand, $event) {
    if(brand) {
      this.brandName = brand.BrandName;
    }
    else {
      this.brandName = '';
    }

    document.querySelector("ul.brand-filter>li.active").classList.remove("active");
    $event.target.classList.add("active");

    this.getSearchText();
    this.search();
  }

  onYearChanged(year: string): void {
    this.year = parseInt(year);
    this._updateVehicles();
  }

  onMakeChanged(make: string): void {
    this.make = make;
    this._updateVehicles();
  }

  onModelChanged(model: string): void {
    this.model = model;

    if(this.enginesSub) {
      this.enginesSub.unsubscribe();
    }

    const options = {
      year: this.year,
      make: this.make,
      model: this.model,
    };

    this.enginesSub = MeteorObservable.subscribe('engines', options).subscribe(() => {
      const engines = _.uniq(Engines.find({}).fetch().map((engine) => getEngineDisplay(engine)));
      this.engines = Observable.of(engines);
    });
  }

  onEngineChanged(engine: string): void {
    this.engine = engine;
  }

  onVendorChanged(vendor: string): void {
    this.vendor = vendor;
    this.curVendor.next(vendor);
    this.search();
  }

  onPriceSortChanged(priceSort: string): void {
    this.priceSort = priceSort;
    this.curPage.next(1);
    this.curPriceSort.next(priceSort);
    this._findProducts();
  }

  getSearchText() {
    const searchText = this.categoryName + ' ' + this.brandName;
    this.searchText = searchText.trim();
  }

  search() {
    if(this._localSearchable()) {
      this._findLocal();
    }
    else {
      this.curPage.next(1);
      this._findProducts();
    }

    if(this._localVideoSearchable()) {
      this._findVideosLocal();
    }
    else {
      this._findVideos();
    }
  }

  _updateVehicles(): void {
    if(this.vehiclesSub) {
      this.vehiclesSub.unsubscribe();
    }

    const options = {
      year: this.year,
      make: this.make,
    };

    this.vehiclesSub = MeteorObservable.subscribe('vehicles', options).subscribe(() => {
      const models = _.uniq(Vehicles.find({}, {sort: {'Model': 1}}).fetch().map((vehicle) => vehicle.Model));
      this.models = Observable.of(models);
    });
  }

  _localSearchable() {
    if(this.priceSort || this.year || this.make || this.model || this.engine) {
      return false;
    }
    else {
      if(this.searchText != this.categoryName)
        return false;
    }

    return true;
  }

  _findProducts(reload = true) {
    this.baseSearch.next(false);
    this.searching = true;
    this.searchFailed = false;

    const options = {
      categoryId: this.categoryId,
      priceSort: this.priceSort,
      vendorFilter: this.vendor,
      reload: reload,
      sessionId: this.sessionId,
    };

    const filters = {
      searchText: this.searchText,
      year: this.year,
      make: this.make,
      model: this.model,
    };

    if(this.engine) {
      filters['engine'] = this.engine;
    }

    // analytics.track('shop', Object.assign({}, options, filters));

    MeteorObservable.call('findProducts', filters, options).subscribe((result) => {
        console.log('Response on find products', result);
      }, (error) => {
        console.error('Error detected on find products', error);
      });
  }

  _findLocal() {
    // analytics.track('shop', {search: 'All'});

    if(this.baseSearch.getValue() === false)
      this.baseSearch.next(true);
  }

  _localVideoSearchable() {
    if(this.year || this.make || this.model) {
      return false;
    }
    else {
      if(this.searchText != this.categoryName)
        return false;
    }

    return true;
  }

  _findVideos() {
    this.baseVideoSearch = false;

    const filters = {
      searchText: this.searchText,
      vendorFilter: this.vendor,
      year: this.year,
      make: this.make,
      model: this.model,
    };

    const options = {
      sessionId: this.sessionId,
    };

    MeteorObservable.call('findVideos', filters, options).subscribe((result) => {
        console.log('Response on find videos', result);
      }, (error) => {
        console.error('Error detected on find videos', error);
      });
  }

  _findVideosLocal() {
    this.baseVideoSearch = true;
  }
}
