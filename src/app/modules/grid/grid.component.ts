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
  selector: 'sx-ng-aggrid',
  templateUrl: 'grid.component.html',
  styleUrls: ['grid.component.css']
})
export class GridComponent implements OnInit, OnDestroy {
  @Input() params: GridParams;

  @ViewChild('agGrid', { static: false }) agGrid: AgGridNg2;

  gridSortModel: ISortModel[] = [];
  gridFilterModel: IFilterModel = null;
  totalPageCount: number = 1;
  currentPageNumber: number = 1;
  pageRowCount: number = 100;
  totalRowCount: number = 0;

  rowData: any[];
  gridOptions: GridOptions;

  isRowViewMode: boolean = false;
  rowViewDataId: number = null;
  rowViewData: { headerName: string, value: any }[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router

  ) {
    this.gridOptions = {
      defaultColDef: {
        width: 120,
        filterParams: { caseSensitive: true, debounceMs: 1000, newRowsAction: 'keep' }
      },
      enableServerSideFilter: true,
      enableServerSideSorting: true,
      enableColResize: true,
      rowSelection: 'single',
      onGridReady: () => {
        // If there is saved filter/sort
        // Then read & load to grid
        let savedFilterSort = this.loadLocalStorageData();
        if (savedFilterSort) {
          this.gridFilterModel = savedFilterSort.gridFilterModel || undefined;
          this.gridSortModel = savedFilterSort.gridSortModel || [];
          this.currentPageNumber = savedFilterSort.currentPageNumber > 0 ? +savedFilterSort.currentPageNumber : 1;

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
    this.saveLocalStorageData();
  }

  saveLocalStorageData() {
    // On Destroy read & save filter/sort/currentPage info
    // We will load it when we are back
    localStorage.setItem(this.params.httpEndpoint, JSON.stringify({
      gridFilterModel: this.gridFilterModel,
      gridSortModel: this.gridSortModel,
      currentPageNumber: this.currentPageNumber
    }));
  }

  loadLocalStorageData() {
    let str = localStorage.getItem(this.params.httpEndpoint)
    if (str) {
      return JSON.parse(str)
    }
    return null;
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
      .get(this.params.httpEndpoint + '/count', { params: params })
      .subscribe(
        (count) => {
          this.totalRowCount = <number>count;
          this.totalPageCount = Math.ceil(this.totalRowCount / this.pageRowCount);

          // check currentPageNumber & offset
          if (this.currentPageNumber == 0 && this.totalPageCount > 0)
            this.currentPageNumber = 1;

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

    this.saveLocalStorageData();
    this.router.navigate([`${this.params.gridFunctions.addBaseUrl}/0`], { queryParams: { returnUrl: this.router.url } });
  }

  onButtonEdit() {
    if (!this.params.gridFunctions.canEdit || !this.params.gridFunctions.editBaseUrl)
      return this.onButtonView();

    let selRow = this.gridOptions.api.getSelectedRows()[0];
    if (!selRow)
      return;

    this.saveLocalStorageData();
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
    console.error(error);

    let errMsg = 'Unknown Error';
    if (error && error.error && error.error.error && error.error.error.message)
      errMsg = error.error.error.message;
    else {
      if (error && error.error && error.error.message)
        errMsg = error.error.message;
      else {
        if (error && error.message)
          errMsg = error.message;
      }
    }

    return errMsg;
  }

  onButtonView() {
    let selRow = this.gridOptions.api.getSelectedRows()[0];
    if (!selRow)
      return;

    this.rowViewData = [];
    this.gridOptions.columnDefs.forEach((column: AgGridColumn) => {
      this.rowViewData.push({
        headerName: column.headerName,
        value: column.valueFormatter ? column.valueFormatter({ value: getObjectValueWithDotNotation(selRow, column.field) }) : getObjectValueWithDotNotation(selRow, column.field)
      });
    });

    this.saveLocalStorageData();
    this.rowViewDataId = selRow.id;
    this.isRowViewMode = true;
  }

  onButtonViewCancel() {
    this.isRowViewMode = false;
  }

  onButtonViewEdit() {
    if (!this.params.gridFunctions.canEdit || !this.params.gridFunctions.editBaseUrl)
      return;

    this.saveLocalStorageData();
    this.router.navigate([`${this.params.gridFunctions.editBaseUrl}/${this.rowViewDataId}`], { queryParams: { returnUrl: this.router.url } });
  }

  onButtonExportCSV() {
    let params = gridSequelizeFormatter(
      this.params.initialSortModel,
      this.params.staticFilter,
      0,
      1000 * 1000, // Allow max record
      this.gridSortModel,
      this.gridFilterModel,
      this.params.httpIncludeParam
    );

    this.http
      .get(this.params.httpEndpoint, { params: params })
      .subscribe(
        (rowData: any[]) => {
          let csvData: string = '"#"'; // First column is row number
          // First Row is labels
          this.gridOptions.columnDefs.forEach((column: AgGridColumn) => {
            csvData = `${csvData};"${column.headerName}"`;
          });
          csvData += '\r\n';

          // Add rows
          for (let i = 0; i < rowData.length; i++) {
            csvData += `"${i + 1}"`;
            this.gridOptions.columnDefs.forEach((column: AgGridColumn) => {
              let value = column.valueFormatter ? column.valueFormatter({ value: getObjectValueWithDotNotation(rowData[i], column.field) }) : getObjectValueWithDotNotation(rowData[i], column.field);
              csvData = `${csvData};"${value}"`;
            });
            csvData += '\r\n';
          }
          downloadCSV(csvData, `Export_Grid`)
        },
        (err) => {
          alert(this.formatErrorMessage(err));
        });
  }
}

/** 
 * Helper Functions
*/

function getObjectValueWithDotNotation(object, keys) {
  return keys.split('.').reduce(function (o, k) {
    return (o || {})[k];
  }, object);
}

function downloadCSV(data: string, filename: string) {
  let htmlElement = document.createElement("a");
  htmlElement.setAttribute('style', 'display:none;');
  document.body.appendChild(htmlElement);

  let blob = new Blob([data], { type: 'text/csv' });
  let url = window.URL.createObjectURL(blob);
  htmlElement.href = url;

  let isIE = /*@cc_on!@*/false || !!(<any>document).documentMode;

  if (isIE) {
    let retVal = navigator.msSaveBlob(blob, filename + '.csv');
  }
  else {
    htmlElement.download = filename + '.csv';
  }

  htmlElement.click();
}
