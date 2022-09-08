import { Component } from '@angular/core';
import { loremIpsumItems } from 'src/assets/lorem-ipsum';
import { Column } from './table/column';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  items = [];
  columns: Column[] = [];
  displays: {key: string, name: string}[];
  selectedDisplay: string;

  readonly numberOfColumns: number = 50;
  readonly numberOfRows: number = 1000;

  constructor() {
    this.init();
  }

  private init(): void {
    this.displays = [
      {key: 'virtualTable', name: 'Virtual Table'},
      {key: 'regularTable', name: 'Regular Table'},
      {key: 'virtualList', name: 'Virtual List'},
      {key: 'regularList', name: 'Regular List'}
    ];
    for (let i = 0; i < this.numberOfRows; i++) {
      let a = {};
      for (let j = 1; j <= this.numberOfColumns; j++) {
        let value = loremIpsumItems[(i * this.numberOfColumns + j) % loremIpsumItems.length];
        a['' + j] = value;
      }
      this.items.push(a);
    }

    for (let i = 1; i <= this.numberOfColumns; i++) {
      this.columns.push(<Column>{
        id: '' + i,
        headerText: loremIpsumItems[i % loremIpsumItems.length],
        columnWidth: 100 + Math.floor(Math.random() * 100),
        cellDisplayPath: '' + i,
      });
    }
  }
}
