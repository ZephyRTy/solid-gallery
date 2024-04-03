import { BasicBookmark, BasicData, Mode, Model } from '../types/global';
import { isBookmarkOfBook, isImageBookmark } from './functions/typeAssertion';
import { RequestOperator } from './request/requestOperator';

export const createStarModel = <T extends BasicData>(
	sqlOperator: RequestOperator
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
		clear() {}
	};
};

export const createBookmarkModel = <T extends BasicBookmark>(
	sqlOperator: RequestOperator
): Model<T> => {
	return {
		dirty: false,
		data: [] as T[],
		dataToUpdate: [] as T[],
		sqlOperator: sqlOperator,
		remove(id) {
			this.data = this.data.filter((item) => item.id !== id);
		},
		clear() {
			this.data = [];
		},
		async update(newData: T, marked: boolean = true) {
			const dataIndex = this.data.findIndex(
				(item) => item.id === newData.id
			);
			if (isImageBookmark(newData)) {
				if (dataIndex !== -1) {
					this.data = [
						newData,
						...this.data.filter((e) => e.id !== newData.id)
					];
					await this.sqlOperator.updateGalleryBookmark(
						newData,
						marked,
						'update'
					);
				} else {
					this.data = [newData, ...this.data];
					await this.sqlOperator.updateGalleryBookmark(
						newData,
						marked,
						'insert'
					);
				}
			} else if (isBookmarkOfBook(newData)) {
				if (dataIndex !== -1) {
					await this.sqlOperator.updateBookmarkOfBook(
						newData,
						marked,
						'update'
					);
					this.data = [
						newData,
						...this.data.filter((e) => e.id !== newData.id)
					];
				} else {
					await this.sqlOperator.updateBookmarkOfBook(
						newData,
						marked,
						'insert'
					);
					this.data = [newData, ...this.data];
				}
			}

			this.data = (await this.sqlOperator.select(
				[],
				Mode.Bookmark
			)) as T[];
		}
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
	submit() {}
};

export const epubCoverCache = new Map<number, string>();
