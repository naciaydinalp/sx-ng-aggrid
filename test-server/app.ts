import * as path from 'path';
import * as express from 'express';
import { Response, Request, NextFunction } from 'express';
import * as http from 'http';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as Sequelize from 'sequelize';
import { Connection, ConnectionList, RestApi, RestAuth } from 'sequelize-rest-acl';

import config from './config';
import restApi from './rest-api';
import { defineModels } from './models/__models';

let app: express.Express = null;
let server: http.Server = null;
let dbConnection: Connection = null;
let port: number = config.port || 3000;

app = express();
app.set('port', port);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

server = http.createServer(app);
server.on('error', (err) => {
  throw err;
});
server.on('listening', () => {
  console.info('********** Server Listening on port ' + port + ' *********');
});

dbConnection = new Connection(config.mainDb);

dbConnection.connect()
  .then(() => {
    ConnectionList.add(config.mainDb.name, dbConnection);
    server.listen(port);

    // Disable auth
    // app.use('/', RestAuth.rootMiddleware(dbConnection.getConnection()));

    // Rest Api
    defineModels(dbConnection.getConnection());
    restApi(app, dbConnection);

    // Error Handlers
    defineErrorHandlers();
  })
  .catch((err: Error) => {
    console.error(err.message);
    process.exit(-1);
  });


/**
 * Error Handlers
 */
function defineErrorHandlers(): void {
  // Last Middleware
  app.use(function (req: Request, res: Response, next: Function) {
    res.sendFile(__dirname + '/public/index.html');
  });

  // Error Handler
  app.use(function (err: Error, req: Request, res: Response, next: Function) {
    let status = 500;
    switch (err.message) {
      case 'ACCESS_ERROR':
        status = 401;
        break;
      case 'LOGIN_FAILED':
        status = 401;
        break;
      case 'WRONG_REQUEST_CONFIG':
        status = 400;
        break;
      default:
        if (app.get('env') === 'development')
          console.error(err.stack);
    }
    res.status(status).send({ name: err.name, message: err.message });
  });
}