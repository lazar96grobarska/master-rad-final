import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  QueryList,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { getPropertyOnPath } from '../common/utils';
import { Column } from './column';
import { ColumnDirective } from './column.directive';

interface Cell {
  columnIndex?: number;
  rowIndex?: number;
  text?: string;
  template?: TemplateRef<any>;
}

const timeoutMillis: number = 10;

@Component({
  selector: 'virtual-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnChanges {
  @Input() columns: Column[];
  @Input() rowHeight: number = 30;
  @Input() items: any[];

  @HostListener('window:resize', ['$event'])
	onResize() {
		this.handleHostSizeChanged();
	}

  private _columnDirectives: ColumnDirective[];
  @ContentChildren(ColumnDirective) private set columnDirectives(
    value: QueryList<ColumnDirective>
  ) {
    this._columnDirectives = value?.toArray();
    this.dataChanged();
  }

  private _elementRef: ElementRef;
  @ViewChild('scrollableElement') private set scrollableElementRef(
    value: ElementRef
  ) {
    if (this._elementRef !== value) {
      this._elementRef = value;
      setTimeout(() => {
        this.handleHostSizeChanged();
      });
      if (this.scrollableElementRef) {
        this.renderer.listen(
          this.scrollableElementRef.nativeElement,
          'scroll',
          () => {
            this.handleScroll();
          }
        );
      }
    }
  }
  private get scrollableElementRef(): ElementRef {
    return this._elementRef;
  }

  allColumns: Column[];

  tableWidth: number;
  tableHeight: number;
  scrollBarWidth: number = 0;
  numberOfVisibleColumns: number;
  contentLeftPosition: number;
  contentTopPosition: number;
  headerLeftMargin: number;

  headerCells: Cell[];
  flatCells: Cell[][];

  private columnOffsets: number[];
  private horizontalScroll: number = 0;
  private verticalScroll: number = 0;
  private scrollContainerWidth: number = 0;
  private scrollContainerHeight: number = 0;
  private lastScrollTimestamp: number;
  private scrollTimeout;

  constructor(private renderer: Renderer2, private cdRef: ChangeDetectorRef) { }

  ngOnChanges({ columns, items }: SimpleChanges): void {
    if (columns || items) {
      this.dataChanged();
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  private dataChanged(): void {
    this.allColumns = [
      ...(this.columns || []),
      ...(this._columnDirectives || []),
    ];

    let width: number = 0;
    this.columnOffsets = [];
    this.allColumns.forEach((column: Column, index: number) => {
      this.columnOffsets[index] = width;
      width += column?.columnWidth || 0;
    });
    this.tableWidth = width;
    this.tableHeight =
      this.rowHeight *
      this.items?.length;
    this.handleHostSizeChanged();
  }

  private handleScroll(): void {
    if (this.scrollTimeout) {
      return;
    }
    const handle = () => {
      this.lastScrollTimestamp = Date.now();
      const horScroll: number =
        this.scrollableElementRef.nativeElement.scrollLeft;
      const verScroll: number = this.scrollableElementRef.nativeElement.scrollTop;
      if (
        horScroll !== this.horizontalScroll ||
        verScroll !== this.verticalScroll
      ) {
        this.horizontalScroll = horScroll;
        this.verticalScroll = verScroll;
        this.generateVisibleContent();
      }
    }
    const timestamp: number = Date.now();
    const nextRefreshInMillis: number = this.lastScrollTimestamp + timeoutMillis - timestamp;
    if (nextRefreshInMillis <= 0) {
      handle();
    }
    else {
      this.scrollTimeout = setTimeout(() => {
        this.scrollTimeout = null;
        handle();
      }, nextRefreshInMillis);
    }
  }

  private handleHostSizeChanged(): void {
    if (this.scrollableElementRef) {
      this.scrollContainerHeight =
        this.scrollableElementRef.nativeElement.clientHeight;
      this.scrollContainerWidth =
        this.scrollableElementRef.nativeElement.clientWidth;
      this.scrollBarWidth =
        this.scrollableElementRef.nativeElement.offsetWidth -
        this.scrollableElementRef.nativeElement.clientWidth;
      this.calculateNumberOfVisibleColumns()
      this.initCells();
      this.generateVisibleContent();
    }
  }

  private initCells(): void {
    if (this.scrollableElementRef) {
      const numberOfVisibleRows: number = Math.ceil(this.scrollContainerHeight / this.rowHeight) + 1;

      this.headerCells = new Array(this.numberOfVisibleColumns).fill(0).map(() => ({}))

      this.flatCells = new Array(numberOfVisibleRows).fill(0).map(() =>
        new Array(this.numberOfVisibleColumns).fill(0).map(() => ({}))
      )
    }
  }

  private calculateNumberOfVisibleColumns(): void {
    let startingIndex: number = 0;
    this.numberOfVisibleColumns = 0;
    let sum: number = 0;
    this.allColumns.forEach((column: Column, index: number) => {
      sum += column.columnWidth;
      if (sum - this.allColumns[startingIndex].columnWidth >= this.scrollContainerWidth) {
        this.numberOfVisibleColumns = Math.max(
          this.numberOfVisibleColumns,
          index - startingIndex + 1
        );
        while (sum - this.allColumns[startingIndex].columnWidth >= this.scrollContainerWidth) {
          sum -= this.allColumns[startingIndex].columnWidth;
          startingIndex++;
        }
      }
    });
    if (this.numberOfVisibleColumns === 0) {
      this.numberOfVisibleColumns = this.allColumns.length;
    }
  }

  private generateVisibleContent(): void {
    if (this.scrollableElementRef) {
      const firstColumnIndex: number = this.getFirstVisibleColumnIndex();
      const firstRowIndex: number = Math.floor(this.verticalScroll / this.rowHeight);

      this.headerCells.forEach((cell: Cell, index: number) => {
        if (index + firstColumnIndex < this.allColumns.length) {
          cell.columnIndex = index + firstColumnIndex;
          cell.text = this.allColumns[cell.columnIndex].headerText;
          cell.template = this.allColumns[cell.columnIndex].headerTemplate;
        }
        else {
          cell.columnIndex = null;
        }
      })

      this.flatCells.forEach((row: Cell[], i: number) => {
        row.forEach((cell: Cell, j: number) => {
          if (i + firstRowIndex < this.items.length && j + firstColumnIndex < this.allColumns.length) {
            cell.rowIndex = i + firstRowIndex;
            cell.columnIndex = j + firstColumnIndex;

            cell.text = this.getCellText(
              this.items[cell.rowIndex],
              cell.columnIndex
            );
            cell.template = this.allColumns[cell.columnIndex].cellTemplate;
          }
          else {
            cell.columnIndex = null;
            cell.rowIndex = null;
          }
        })
      })
      this.contentLeftPosition = this.columnOffsets[firstColumnIndex];
      this.contentTopPosition = firstRowIndex * this.rowHeight;
      this.headerLeftMargin = this.contentLeftPosition - this.horizontalScroll;
    }
    this.cdRef.markForCheck()
  }

  private getFirstVisibleColumnIndex(): number {
    let left: number = 0;
    let right: number = this.allColumns.length - 1;
    while (left !== right) {
      const middle: number = Math.ceil((left + right) / 2);
      if (
        this.columnOffsets[middle] <= this.horizontalScroll &&
        (middle === right ||
          this.columnOffsets[middle + 1] > this.horizontalScroll)
      ) {
        left = middle;
        right = middle;
      } else if (this.columnOffsets[middle] > this.horizontalScroll) {
        right = middle - 1;
      } else if (this.columnOffsets[middle + 1] <= this.horizontalScroll) {
        left = middle + 1;
      }
    }
    return left;
  }

  getCellText(
    item: any,
    columnIndex: number
  ): string {
    const column = this.allColumns[columnIndex]
    if (column.cellDisplayFn) {
      return column.cellDisplayFn(item, columnIndex);
    }
    if (column.cellDisplayPath) {
      return getPropertyOnPath(item, column.cellDisplayPath);
    }
    return null;
  };
}
