import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TableComponent } from './table/table.component';
import { CellTemplateDirective } from './table/cell-template.directive';
import { HeaderTemplateDirective } from './table/header-template.directive';
import { ColumnDirective } from './table/column.directive';
import { ItemTemplateDirective } from './list/item-template.directive';
import { ListComponent } from './list/list.component';

@NgModule({
  declarations: [
    AppComponent,
    TableComponent,
    CellTemplateDirective,
    HeaderTemplateDirective,
    ColumnDirective,
    ItemTemplateDirective,
    ListComponent
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
