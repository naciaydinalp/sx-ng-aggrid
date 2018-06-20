import { HttpParams } from "@angular/common/http";
import { gridSortFormatter, ISortModel } from './grid-sequelize-sort';
import { gridFilterFormatter, IFilterModel } from './grid-sequelize-filter';
import { IIncludeModelItem, gridIncludeFormatter } from "./grid-sequelize-include";

export function gridSequelizeFormatter(
    initialSortModel: ISortModel[],
    staticFilterModel: IFilterModel,
    currentPageNumber: number,
    pageRowCount: number,
    sortModel: ISortModel[],
    filterModel: IFilterModel,
    includeModel: IIncludeModelItem[]): any {
    let params: any = {
        offset: currentPageNumber > 0 ? (currentPageNumber - 1) * pageRowCount : 0,
        limit: pageRowCount,
        order: gridSortFormatter(initialSortModel, sortModel),
    };
    let where = gridFilterFormatter(staticFilterModel, filterModel);
    let include = gridIncludeFormatter(includeModel, filterModel);
    if (where)
        params.where = where;
    if (include)
        params.include = include;
    return params;
}