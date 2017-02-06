import { Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { Meteor } from 'meteor/meteor';
import { Observable, Subscription, Subject } from "rxjs";
import { PaginationService } from "ng2-pagination";
import { MeteorObservable } from "meteor-rxjs";
import { Counts } from "meteor/tmeasday:publish-counts";
import * as _ from 'underscore';

import { SessionService } from '../shared/session.service';
import { Product } from "../../../../both/models/product.model";
import { Products } from "../../../../both/collections/products.collection";
import { Make } from "../../../../both/models/make.model";
import { Makes } from "../../../../both/collections/makes.collection";
import { Vehicle } from '../../../../both/models/vehicle.model';
import { Vehicles } from "../../../../both/collections/vehicles.collection";
import { Engine } from '../../../../both/models/engine.model';
import { Engines } from "../../../../both/collections/engines.collection";
import { getEngineDisplay } from "../../../../both/methods/utils";
import { GlobalPart } from '../../../../both/models/globalpart.model';
import { GlobalParts } from "../../../../both/collections/globalparts.collection";
import { Vendor } from '../../../../both/models/vendor.model';
import { Vendors } from "../../../../both/collections/vendors.collection";

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
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  nameOrder: Subject<number> = new Subject<number>();
  perPage: number = 20; // Meteor.settings['public']['perPage'];
  optionsSub: Subscription;
  autorunSub: Subscription;
  products: Observable<Product[]>;
  productsSub: Subscription;
  productsSize: number = 0;
  vehicles: Observable<Vehicle[]>;
  vehiclesSub: Subscription;
  makes: Observable<Make[]>;
  makesSub: Subscription;
  models: Observable<string[]>;
  engines: Observable<string[]>;
  enginesSub: Subscription;
  vendors: Observable<Vendor[]>;
  vendorsSub: Subscription;
  years: number[];
  year: number = 0;
  make: string = '';
  model: string = '';
  engine: string = '';

  constructor(private session: SessionService, private pagination: PaginationService, private zone: NgZone) {
    console.log(this.session.id());

    const years: number[] = [];
    const maxYear:number = (new Date()).getFullYear() + 1;

    for(let i=1980; i<=maxYear; i++) {
      years.push(i);
    }
    this.years = years;
  }

  ngOnInit() {
    this.optionsSub = Observable.combineLatest(
      this.pageSize,
      this.curPage,
      this.nameOrder,
    ).subscribe(([pageSize, curPage, nameOrder]) => {
      const options: Options = {
        limit: pageSize as number,
        skip: ((curPage as number) - 1) * (pageSize as number),
        sort: { name: nameOrder as number }
      };

      this.pagination.setCurrentPage(this.pagination.defaultId, curPage as number);

      if (this.productsSub) {
        this.productsSub.unsubscribe();
      }

      const filter = {};

      this.productsSub = MeteorObservable.subscribe('products', options, filter).subscribe(() => {
        this.products = Products.find({}, {
          sort: {
            name: nameOrder
          }
        }).zone();
      });

    });

    this.pagination.register({
      id: this.pagination.defaultId,
      itemsPerPage: this.perPage,
      currentPage: 1,
      totalItems: this.productsSize
    });

    this.pageSize.next(this.perPage);
    this.curPage.next(1);
    this.nameOrder.next(1);

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.productsSize = Counts.get('numberOfProducts');
      this.pagination.setTotalItems(this.pagination.defaultId, this.productsSize);
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
    this.productsSub.unsubscribe();
    this.optionsSub.unsubscribe();
    this.autorunSub.unsubscribe();
    this.makesSub.unsubscribe();
    this.vehiclesSub.unsubscribe();
    this.enginesSub.unsubscribe();
    this.vendorsSub.unsubscribe();
  }

  search(value: string): void {
    this.curPage.next(1);
  }

  onPageChanged(page: number): void {
    this.curPage.next(page);
  }

  changeSortOrder(nameOrder: string): void {
    this.nameOrder.next(parseInt(nameOrder));
  }

  onYearChanged(year: string): void {
    this.year = parseInt(year);

    this._updateVehicles();
  }

  onMakeChanged(make: string): void {
    this.make = make;

    this._updateVehicles();
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

  }
}
