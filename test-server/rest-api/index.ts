import { Application } from 'express';
import { Connection, AuthApi, UserApi, GroupApi, RoleMappingApi } from 'sequelize-rest-acl';
import area from './area';
import factory from './factory';

export default (app: Application, db: Connection) => {
    app.use('/api/auth', AuthApi(db));
    app.use('/api/user', UserApi(db));
    app.use('/api/group', GroupApi(db));
    app.use('/api/roleMapping', RoleMappingApi(db));

    app.use('/api/area', area(db));
    app.use('/api/factory', factory(db));
}