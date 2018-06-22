import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { GridOptions } from "ag-grid";
import { AgGridNg2, AgGridColumn } from 'ag-grid-angular';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
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
  keepUserFilterSort: boolean;
};

@Component({
  selector: 'sequelize-ng-aggrid',
  templateUrl: 'grid.component.html',
  styleUrls: ['grid.component.css']
})
export class GridComponent implements OnInit, OnDestroy {
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
    private route: ActivatedRoute,
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
        // If there is saved filter/sort
        // Then read & load to grid
        let savedFilterSortStr = localStorage.getItem(this.params.httpEndpoint);
        if (savedFilterSortStr) {
          let savedFilterSort = JSON.parse(savedFilterSortStr);
          this.gridFilterModel = savedFilterSort.gridFilterModel || undefined;
          this.gridSortModel = savedFilterSort.gridSortModel || [];
          this.currentPageNumber = savedFilterSort.currentPageNumber;

          // Changing filter or sort will call onSortChanged/onFilterChanged
          // TODO: This will refresh page twice, fix it
          this.gridOptions.api.setSortModel(this.gridSortModel);
          this.gridOptions.api.setFilterModel(this.gridFilterModel);
        } else {
          this.refresh();
        }
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
        this.onButtonEdit();
      }
    };
  }

  ngOnInit() { }

  ngOnDestroy() {
    // On Destroy read & save filter/sort/currentPage info
    // We will load it when we are back
    localStorage.setItem(this.params.httpEndpoint, JSON.stringify({
      gridFilterModel: this.gridFilterModel,
      gridSortModel: this.gridSortModel,
      currentPageNumber: this.currentPageNumber
    }));
  }

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
                alert(this.formatErrorMessage(err));
              });
        },
        (err) => {
          alert(this.formatErrorMessage(err));
        });
  }

  onButtonAdd() {
    if (!this.params.gridFunctions.canAdd || !this.params.gridFunctions.addBaseUrl)
      return;
    this.router.navigate([`${this.params.gridFunctions.addBaseUrl}/0`], { queryParams: { returnUrl: this.router.url } });
  }

  onButtonEdit() {
    if (!this.params.gridFunctions.canEdit || !this.params.gridFunctions.editBaseUrl)
      return;
    let selRow = this.gridOptions.api.getSelectedRows()[0];
    if (!selRow)
      return;
    this.router.navigate([`${this.params.gridFunctions.editBaseUrl}/${selRow.id}`], { queryParams: { returnUrl: this.router.url } });
  }

  onButtonDelete() {
    if (!this.params.gridFunctions.canDelete)
      return;
    let selRow = this.gridOptions.api.getSelectedRows()[0];
    if (!selRow)
      return;

    if (confirm('Delete?')) {
      this.http
        .delete(this.params.httpEndpoint + '/' + selRow.id)
        .subscribe(
          (result) => {
            this.refresh();
          },
          (err) => {
            alert(this.formatErrorMessage(err));
          });
    }

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

  formatErrorMessage(error: any) {
    return `${error.statusText} / ${error.error.name} : ${error.error.message}`
  }
}