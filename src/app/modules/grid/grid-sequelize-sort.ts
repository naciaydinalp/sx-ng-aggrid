export interface ISortModel {
    colId: string;
    sort: string;
};

export function gridSortFormatter(initialSortModel: ISortModel[], gridSortModel: ISortModel[]): string {
    let formattedSort = [];
    let sortModel: ISortModel[] = initialSortModel;
    if (gridSortModel)
        sortModel = gridSortModel;
    if (!sortModel || !Array.isArray(sortModel))
        return undefined;

    for (let i = 0; i < sortModel.length; i++) {
        formattedSort.push([sortModel[i].colId, sortModel[i].sort.toUpperCase()]);
    }
    return JSON.stringify(formattedSort);
}