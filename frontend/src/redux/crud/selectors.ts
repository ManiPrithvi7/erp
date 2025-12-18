import { createSelector } from 'reselect';
import { RootState } from '@/redux/store';

const selectCrud = (state: RootState) => state.crud;

export const selectCurrentItem = createSelector([selectCrud], (crud) => crud.current);

export const selectListItems = createSelector([selectCrud], (crud) => crud.list);
export const selectItemById = (itemId: string) =>
  createSelector(selectListItems, (list) => list.result.items.find((item: any) => item._id === itemId));

export const selectCreatedItem = createSelector([selectCrud], (crud) => crud.create);

export const selectUpdatedItem = createSelector([selectCrud], (crud) => crud.update);

export const selectReadItem = createSelector([selectCrud], (crud) => crud.read);

export const selectDeletedItem = createSelector([selectCrud], (crud) => crud.delete);

export const selectSearchedItems = createSelector([selectCrud], (crud) => crud.search);

