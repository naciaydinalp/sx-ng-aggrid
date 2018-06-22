# SequelizeNgAggrid
An ag-grid template for easy usage including sample pages & a sample test-server.

![Sample Grid](https://github.com/doganmurat/sequelize-ng-aggrid/raw/master/sample-grid.png)

![Sample Detail](https://github.com/doganmurat/sequelize-ng-aggrid/raw/master/sample-detail.png)

>Frontend : Angular 6 & Ag-grid

>Backend : Sequelize & Express. Check [sequelize-rest-acl](https://github.com/doganmurat/sequelize-rest-acl)

> This project is using ng-packagr to package library

## Usage Example
```
* cd YOUR_PROJECT
* npm i --save-dev https://github.com/doganmurat/sequelize-ng-aggrid/releases/latest
* npm i --save-dev ag-grid@^18.0.1 ag-grid-angular@^18.0.1 bootstrap font-awesome moment    --> Install peer dependencies

Edit angular.json & add these lines to styles array
"node_modules/bootstrap/dist/css/bootstrap.css",
"node_modules/ag-grid/dist/styles/ag-grid.css",
"node_modules/ag-grid/dist/styles/ag-theme-fresh.css",
"node_modules/font-awesome/css/font-awesome.css",

Edit app.module.ts
import { GridModule } from 'sequelize-ng-aggrid';           --> Add import
....
 imports: [
    BrowserModule,
    GridModule
  ],
  ....

Now you are ready
Check test & test-detail components for other usage examples
```

## Build
```
* git clone https://github.com/doganmurat/sequelize-ng-aggrid.git
* cd sequelize-ng-aggrid
* npm i
* cd test-server
* npm i
* npm build
* npm run start     --> This will start test-server. Check db config in test-server/config.ts

In another shell
* cd sequelize-ng-aggrid
* npm run start     --> Start test app

Packaging
* npm run packagr   --> Package App
* cd dist
* npm pack --> This will create sequelize-ng-aggrid.XX.tgz. 
```

>You can use library from other angular projects like  this;
```
npm install ./sequelize-ng-aggrid.XX.tgz
```