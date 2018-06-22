import * as Sequelize from 'sequelize';
import { OnOffStatus } from '../enum/OnOffStatus';

export const modelName = 'Factory';

export interface Attributes {
    id: number;
    name: string;
    comment: string;
    status: OnOffStatus;
};

export interface Instance extends Sequelize.Instance<Attributes>, Attributes { };

export const define = (sequalize: Sequelize.Sequelize): Sequelize.Model<Instance, Attributes> => {
    let model = sequalize.define<Instance, Attributes>(modelName, {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING(32), allowNull: false, unique: true },
        comment: Sequelize.STRING(32),
        status: {
            type: Sequelize.ENUM,
            values: Object.keys(OnOffStatus)
        }
    });

    return model;
};
