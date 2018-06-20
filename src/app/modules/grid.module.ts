import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { GridComponent } from './grid/grid.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forRoot([]),
    AgGridModule.withComponents([])
  ],
  declarations: [GridComponent],
  exports: [
    GridComponent
  ]
})
export class GridModule { }
