import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, Subject } from "rxjs";
import { PaginationService } from "ng2-pagination";
import { MeteorObservable } from "meteor-rxjs";
import { Counts } from "meteor/tmeasday:publish-counts";
import { Product } from "../../../../both/models/product.model";
import { Products } from "../../../../both/collections/products.collection";
import { SessionService } from '../shared/session.service';

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
  products: Observable<Product[]>;
  productsSub: Subscription;
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  nameOrder: Subject<number> = new Subject<number>();
  optionsSub: Subscription;
  partiesSize: number = 0;
  autorunSub: Subscription;

  constructor(public session: SessionService, private paginationService: PaginationService) {
    console.log(this.session.id());
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

      this.paginationService.setCurrentPage(this.paginationService.defaultId, curPage as number);

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

    this.paginationService.register({
      id: this.paginationService.defaultId,
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.partiesSize
    });

    this.pageSize.next(10);
    this.curPage.next(1);
    this.nameOrder.next(1);

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.partiesSize = Counts.get('numberOfProducts');
      this.paginationService.setTotalItems(this.paginationService.defaultId, this.partiesSize);
    });
  }

  ngOnDestroy() {
    this.productsSub.unsubscribe();
    this.optionsSub.unsubscribe();
    this.autorunSub.unsubscribe();
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
}
