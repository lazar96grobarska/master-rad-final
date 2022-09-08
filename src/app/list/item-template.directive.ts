import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[itemTemplate]',
})
export class ItemTemplateDirective {
    constructor(public templateRef: TemplateRef<any>) { }
}
