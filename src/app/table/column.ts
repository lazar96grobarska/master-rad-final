import { Directive, Input, TemplateRef } from '@angular/core';

@Directive()
export class Column {
  @Input() id: string;
  @Input() headerText?: string;
  @Input() headerTemplate?: TemplateRef<any>;
  @Input() cellDisplayPath?: string;
  @Input() cellDisplayFn?: (item: any, columnIndex: number) => string;
  @Input() cellTemplate?: TemplateRef<any>;
  @Input() columnWidth: number;
}
