import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

export { PageNotFoundComponent };

@NgModule({
  imports: [CommonModule, PageNotFoundComponent],
  exports: [PageNotFoundComponent],
})
export class BaseModule {}
