import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[headerTemplate]',
})
export class HeaderTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}
