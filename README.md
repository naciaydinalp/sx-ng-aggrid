# SequelizeNgAggrid
An ag-grid template for easy usage including sample pages & a sample test-server.

![Sample Grid](https://github.com/doganmurat/sequelize-ng-aggrid/raw/master/sample-grid.png)

![Sample Detail](https://github.com/doganmurat/sequelize-ng-aggrid/raw/master/sample-detail.png)

>Frontend : Angular 6 & Ag-grid

>Backend : Sequelize & Express. Check [sequelize-rest-acl](https://github.com/doganmurat/sequelize-rest-acl)

> This projet is using ng-packagr to package library

## Usage Example

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