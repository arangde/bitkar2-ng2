import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { AgmCoreModule } from 'angular2-google-maps/core';

import { AppComponent } from "./app.component";
import { routes } from './app.routes';
import { SHARED_DECLARATIONS } from './shared';
import { PRODUCTS_DECLARATIONS } from "./products/index";
// import { PARTIES_DECLARATIONS } from './parties';
// import { AUTH_DECLARATIONS } from "./auth/index";
// import { MOBILE_DECLARATIONS } from "./mobile/index";
// import { AppMobileComponent } from "./mobile/app.component.mobile";
// import { IonicModule, IonicApp } from "ionic-angular";
import { SessionService } from "./shared/session.service";

let moduleDefinition = {
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    Ng2PaginationModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAWoBdZHCNh5R-hB5S5ZZ2oeoYyfdDgniA'
    })
  ],
  declarations: [
    AppComponent,
    ...PRODUCTS_DECLARATIONS,
    ...SHARED_DECLARATIONS,
  ],
  providers: [
    SessionService
  ],
  bootstrap: [
    AppComponent
  ]
}

@NgModule(moduleDefinition)
export class AppModule {}