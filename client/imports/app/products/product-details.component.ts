import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Meteor } from 'meteor/meteor';
import { MeteorObservable } from 'meteor-rxjs';

import 'rxjs/add/operator/map';

import template from './product-details.component.html';
import style from '../scss/product-details.scss';

@Component({
  selector: 'product-details',
  template,
  styles: [ style ]
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  paramsSub: Subscription;
  productSub: Subscription;

  constructor(
    private route: ActivatedRoute
  ) {}

  ngOnInit() {

  }

  ngOnDestroy() {
    this.paramsSub.unsubscribe();
    this.productSub.unsubscribe();
  }
}
