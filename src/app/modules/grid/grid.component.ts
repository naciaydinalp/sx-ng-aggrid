import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { GridOptions } from "ag-grid";
import { AgGridNg2, AgGridColumn } from 'ag-grid-angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ISortModel } from './grid-sequelize-sort';
import { IFilterModel } from './grid-sequelize-filter';
import { IIncludeModelItem } from './grid-sequelize-include';
import { gridSequelizeFormatter } from './grid-sequelize';
import { GridValueFormatter as _GridValueFormatter } from './grid-value-formatter';

export enum GridFilterType {
  Text = 'agTextColumnFilter',
  Date = 'agDateColumnFilter',
  Number = 'agNumberColumnFilter'
};

export const GridValueFormatter = _GridValueFormatter;

export interface GridParams {
  httpEndpoint: string;
  httpIncludeParam: IIncludeModelItem[];
  initialSortModel: ISortModel[];
  staticFilter: IFilterModel;
  gridFunctions: {
    addBaseUrl: string,
    editBaseUrl: string,
    canAdd: boolean,
    canEdit: boolean,
    canDelete: boolean,
  };
  columnDefs: Partial<AgGridColumn>[];
};

@Component({
  selector: 'sequelize-ng-aggrid',
  templateUrl: 'grid.component.html',
  styleUrls: ['grid.component.css']
})
export class GridComponent implements OnInit {
  @Input() params: GridParams;

  @ViewChild('agGrid') agGrid: AgGridNg2;

  gridSortModel: ISortModel[] = [];
  gridFilterModel: IFilterModel = null;
  totalPageCount: number = 1;
  currentPageNumber: number = 1;
  pageRowCount: number = 3;
  totalRowCount: number = 0;

  rowData: any[];
  gridOptions: GridOptions;

  constructor(
    private http: HttpClient,
    private router: Router

  ) {
    this.gridOptions = {
      defaultColDef: {
        width: 120,
        filterParams: { newRowsAction: 'keep' }
      },
      enableServerSideFilter: true,
      enableServerSideSorting: true,
      enableColResize: true,
      rowSelection: 'single',
      onGridReady: () => {
        this.refresh();
      },
      onSortChanged: () => {
        this.gridSortModel = this.gridOptions.api.getSortModel();
        this.refresh();
      },
      onFilterChanged: () => {
        this.gridFilterModel = this.gridOptions.api.getFilterModel();
        this.refresh();
      },
      onRowDoubleClicked: (event) => {
        if (!this.params.gridFunctions.canEdit || !this.params.gridFunctions.editBaseUrl)
          return;
        this.router.navigateByUrl(`${this.params.gridFunctions.editBaseUrl}/${event.data.id}`);
      }
    };
  }

  ngOnInit() { }

  refresh() {
    let params = gridSequelizeFormatter(
      this.params.initialSortModel,
      this.params.staticFilter,
      this.currentPageNumber,
      this.pageRowCount,
      this.gridSortModel,
      this.gridFilterModel,
      this.params.httpIncludeParam
    );
    this.http
      .get(this.params.httpEndpoint + '/count', { params: params.where ? { where: params.where } : {} })
      .subscribe(
        (count) => {
          console.log(1);
          this.totalRowCount = <number>count;
          this.totalPageCount = Math.ceil(this.totalRowCount / this.pageRowCount);

          // check currentPageNumber & offset
          if (this.currentPageNumber > this.totalPageCount) {
            this.currentPageNumber = this.totalPageCount;
            params.offset = this.currentPageNumber > 0 ? (this.currentPageNumber - 1) * this.pageRowCount : 0
          }

          this.http
            .get(this.params.httpEndpoint, { params: params })
            .subscribe(
              (rowData) => {
                this.rowData = <any>rowData;
                this.gridOptions.api.setRowData(this.rowData);
                this.gridOptions.api.sizeColumnsToFit();
              },
              (err) => {
                console.error(err);
              });
        },
        (err) => {
          console.error(err);
        });
  }

  onButtonAdd() {
    if (!this.params.gridFunctions.canAdd || !this.params.gridFunctions.addBaseUrl)
      return;
    this.router.navigateByUrl(`${this.params.gridFunctions.addBaseUrl}`);
  }

  onButtonEdit() {
    if (!this.params.gridFunctions.canEdit || !this.params.gridFunctions.editBaseUrl)
      return;
    let selRow = this.gridOptions.api.getSelectedRows()[0];
    if (!selRow)
      return;
    this.router.navigateByUrl(`${this.params.gridFunctions.editBaseUrl}/${selRow.id}`);
  }

  onButtonDelete() {
    if (!this.params.gridFunctions.canDelete)
      return;
    let selRow = this.gridOptions.api.getSelectedRows()[0];
    if (!selRow)
      return;
    //this.router.navigateByUrl(`${this.gridFunctions.editBaseUrl}/${selRow.id}`);
  }

  onButtonBackward() {
    if (this.currentPageNumber <= 1)
      return;
    this.currentPageNumber = 1;
    this.refresh();
  }

  onButtonForward() {
    if (this.currentPageNumber >= this.totalPageCount)
      return;
    this.currentPageNumber = this.totalPageCount;
    this.refresh();
  }

  onButtonNext() {
    if (this.currentPageNumber >= this.totalPageCount)
      return;
    this.currentPageNumber = this.currentPageNumber + 1;
    this.refresh();
  }

  onButtonPrevious() {
    if (this.currentPageNumber <= 1)
      return;
    this.currentPageNumber = this.currentPageNumber - 1;
    this.refresh();
  }

  onButtonRefresh() {
    this.refresh();
  }
}