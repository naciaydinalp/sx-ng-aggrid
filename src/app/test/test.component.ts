import { Component, OnInit } from '@angular/core';
import { GridComponent, GridFilterType, GridValueFormatter, GridParams } from '../modules/grid/grid.component';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  params: GridParams = {
    httpEndpoint: 'http://localhost:3000/api/area',
    httpIncludeParam: [{ model: 'Factory', attributes: ['id', 'name'] }],
    keepUserFilterSort: true,
    gridFunctions: {
      addBaseUrl: '/area/edit',
      editBaseUrl: '/area/edit',
      canAdd: true,
      canDelete: true,
      canEdit: true
    },
    initialSortModel: null,
    staticFilter: null,
    columnDefs: [
      { headerName: "ID", field: "id", filter: GridFilterType.Number, hide: true },
      { headerName: "Name", field: "name", width: 280 },
      { headerName: "comment", field: "comment" },
      { headerName: "factoryId", field: "Factory.name" },
      { headerName: "status", field: "status" },
      { headerName: "createdAt", field: "createdAt", width: 200, filter: GridFilterType.Date, valueFormatter: GridValueFormatter.date },
      { headerName: "updatedAt", field: "updatedAt", width: 200, filter: GridFilterType.Date, valueFormatter: GridValueFormatter.date }
    ]
  };
  constructor() { }

  ngOnInit() { }

}
