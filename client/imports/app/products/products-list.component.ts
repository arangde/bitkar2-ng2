import { Component, OnDestroy, OnInit } from '@angular/core';
import { PaginationService } from 'ng2-pagination';

import template from './products-list.component.html';
import style from '../less/products-list.less';
import { SessionService } from '../shared/session.service';

@Component({
  selector: 'products-list',
  template,
  styles: [ style ]
})
export class ProductsListComponent implements OnInit, OnDestroy {
  constructor(
    public session: SessionService,
  ) {
  }

  ngOnInit() {
    console.log(this.session.id());
  }

  ngOnDestroy() {

  }
}
