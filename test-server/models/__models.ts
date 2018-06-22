import * as  Sequelize from 'sequelize';
import * as area from './area';
import * as factory from './factory';

let models: {
    Area: Sequelize.Model<area.Instance, area.Attributes>
    Factory: Sequelize.Model<factory.Instance, factory.Attributes>
} = {
        Area: null,
        Factory: null
    };
export function defineModels(sequelize: Sequelize.Sequelize): void {
    models.Factory = factory.define(sequelize);
    models.Area = area.define(sequelize);

    sequelize.sync();
};

export { models };