import { BasicData, Mode, Model } from '../types/global';
import { RequestOperator } from './sql/requestOperator';

export const createStarModel = <T extends BasicData>(
  sqlOperator: RequestOperator,
): Model<T> => {
  return {
    dirty: false,
    data: [] as T[],
    dataToUpdate: [] as T[],
    sqlOperator: sqlOperator,
    async update(newStar?: T) {
      this.dirty = true;
      if (newStar) {
        await this.sqlOperator.updateStar(newStar);
      }
      this.data = await this.sqlOperator.select([], Mode.Star);
    },
    remove(id) {
      this.data = this.data.filter((item) => item.id !== id);
    },
    clear() {},
  };
};

export const selectionModel = {
  selected: new Set<number>(),
  update(index: number, selected: boolean) {
    if (selected) {
      this.selected.add(index);
    } else if (this.selected.has(index)) {
      this.selected.delete(index);
    }
  },
  submit() {},
};
