import * as Sequelize from 'sequelize';
import { OnOffStatus } from '../enum/OnOffStatus';

export const modelName = 'Area';

export interface Attributes {
    id: number;
    name: string;
    comment: string;
    factoryId: number;
    status: OnOffStatus;
};

export interface Instance extends Sequelize.Instance<Attributes>, Attributes { };

export const define = (sequalize: Sequelize.Sequelize): Sequelize.Model<Instance, Attributes> => {
    let model = sequalize.define<Instance, Attributes>(modelName, {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING(32), allowNull: false, unique: true },
        comment: Sequelize.STRING(32),
        factoryId: { type: Sequelize.INTEGER, allowNull: false, onDelete: 'RESTRICT' },
        status: {
            type: Sequelize.ENUM,
            values: Object.keys(OnOffStatus)
        }
    });

    model.belongsTo(sequalize.models['Factory'], { foreignKey: 'factoryId' });

    return model;
};
