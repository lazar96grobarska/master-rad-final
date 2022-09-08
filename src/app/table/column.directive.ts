import { ContentChild, Directive } from '@angular/core';
import { CellTemplateDirective } from './cell-template.directive';
import { Column } from './column';
import { HeaderTemplateDirective } from './header-template.directive';

@Directive({
  selector: 'column',
})
export class ColumnDirective extends Column {
  @ContentChild(HeaderTemplateDirective) private set headerTemplateDirective(
    value: HeaderTemplateDirective
  ) {
    if (value) {
      this.headerTemplate = value.templateRef;
    }
  }

  @ContentChild(CellTemplateDirective) private set cellTemplateDirective(
    value: CellTemplateDirective
  ) {
    if (value) {
      this.cellTemplate = value.templateRef;
    }
  }
}
