import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[cellTemplate]',
})
export class CellTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) { }
}
