import * as express from 'express';
import * as Sequelize from 'sequelize';
import { RestAuth, RestApi, Connection } from 'sequelize-rest-acl';
import { models } from '../models/__models';
import * as Model from '../models/factory';

export default function (db: Connection): express.Router {
    let router: express.Router = express.Router();
    let DbModel = models.Factory;
    let modelApi = new RestApi<Model.Instance, Model.Attributes>(DbModel, db.getConnection().models);

    router.get('/', /**RestAuth.middleware('@auth', 'GET:All factory'),**/ modelApi.getAll());
    router.get('/count',/** RestAuth.middleware('@auth', 'GET:COUNT factory'), **/modelApi.count());
    router.get('/:id',/** RestAuth.middleware('@auth', 'GET:ONE factory'),**/ modelApi.getById());
    router.post('/',/** RestAuth.middleware('area', 'CREATE factory'),**/ modelApi.create());
    router.put('/:id',/** RestAuth.middleware('area', 'UPDATE factory'),**/ modelApi.updateById());
    router.delete('/:id',/** RestAuth.middleware('area', 'DELETE factory'), **/modelApi.deleteById());

    return router;
}
