import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ElementRef, HostListener, Input, Renderer2, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { getPropertyOnPath } from "../common/utils";
import { ItemTemplateDirective } from "./item-template.directive";

interface VisibleItem {
  index?: number;
  text?: string;
}

const timeoutMillis: number = 10;

@Component({
  selector: 'virtual-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  @Input() itemHeight: number = 30;
  @Input() items: any[];
  @Input() itemDisplayPath: string;
  @Input() itemDisplayFn: (item: any) => string;
  @Input() itemTemplate: TemplateRef<any>;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.handleHostSizeChanged();
  }

  @ContentChild(ItemTemplateDirective) private set itemTemplateDirective(
    value: ItemTemplateDirective
  ) {
    if (value) {
      this.itemTemplate = value.templateRef;
    }
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

  listHeight: number
  contentTopPosition: number;

  visibleItems: VisibleItem[];

  private verticalScroll: number = 0;
  private scrollContainerHeight: number = 0;
  private lastScrollTimestamp: number;
  private scrollTImeout;

  constructor(private renderer: Renderer2, private cdRef: ChangeDetectorRef) { }

  ngOnChanges({ items }: SimpleChanges): void {
    if (items) {
      this.dataChanged();
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  private dataChanged(): void {
    this.listHeight = this.items?.length * this.itemHeight;
    this.handleHostSizeChanged();
  }

  private handleScroll(): void {
    if (this.scrollTImeout) {
      return;
    }
    const handle = () => {
      this.lastScrollTimestamp = Date.now();
      const verScroll: number = this.scrollableElementRef.nativeElement.scrollTop;
      if (verScroll !== this.verticalScroll) {
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
      this.scrollTImeout = setTimeout(() => {
        this.scrollTImeout = null;
        handle();
      }, nextRefreshInMillis);
    }
  }

  private handleHostSizeChanged(): void {
    if (this.scrollableElementRef) {
      this.scrollContainerHeight = this.scrollableElementRef.nativeElement.clientHeight;
      this.initListItems();
      this.generateVisibleContent();
    }
  }

  private initListItems(): void {
    if (this.scrollableElementRef) {
      const numberOfVisibleItems: number = Math.ceil(this.scrollContainerHeight / this.itemHeight) + 1;
      this.visibleItems = new Array(numberOfVisibleItems).fill(0).map(() => ({}));
    }
  }

  private generateVisibleContent(): void {
    if (this.scrollableElementRef) {
      const firstItemIndex: number = Math.floor(this.verticalScroll / this.itemHeight);

      this.visibleItems.forEach((visibleItem: VisibleItem, index: number) => {
        if (index + firstItemIndex < this.items.length) {
          visibleItem.index = index + firstItemIndex;
          visibleItem.text = this.getItemText(this.items[visibleItem.index]);
        }
        else {
          visibleItem.index = null;
        }
      })
      this.contentTopPosition = firstItemIndex * this.itemHeight;
    }
    this.cdRef.markForCheck()
  }

  private getItemText(item: any): string {
    if (this.itemDisplayFn) {
      return this.itemDisplayFn(item);
    }
    if (this.itemDisplayPath) {
      return getPropertyOnPath(item, this.itemDisplayPath);
    }
    return null;
  }
}