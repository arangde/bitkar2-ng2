import { Component, OnDestroy, OnInit } from '@angular/core';
import { PaginationService } from 'ng2-pagination';

import template from './products-list.component.html';
import style from '../scss/products-list.scss';

@Component({
  selector: 'products-list',
  template,
  styles: [ style ]
})
export class ProductsListComponent implements OnInit, OnDestroy {
  constructor() {

  }

  ngOnInit() {

  }

  ngOnDestroy() {

  }
}
