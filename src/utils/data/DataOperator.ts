/* eslint-disable camelcase */
/* eslint-disable new-cap */
/* eslint-disable no-unused-vars */
import { fromJS, Map } from 'immutable';
import React from 'react';
import {
	defaultCover,
	getBookmarkThumb,
	packCountOfSinglePage
} from '../../types/constant';
import {
	BasicBookmark,
	BasicData,
	BasicFolder,
	DirectoryInfo,
	Mode,
	Model
} from '../../types/global';
import { compress } from '../functions/compressThumb';
import {
	convertJsRegToMysqlReg,
	endsWith,
	notMoreThanOne,
	parseUrlQuery
} from '../functions/functions';
import { hasCover } from '../functions/typeAssertion';
import {
	createBookmarkModel,
	createStarModel,
	selectionModel
} from '../models';
import { RequestOperator } from '../request/requestOperator';
const fs = window.require('fs');
const isImage = (v: string) =>
	endsWith(v.toLocaleLowerCase(), '.jpg', 'png', 'jpeg', 'webp');
const checkImageSize = (path: string) => {
	const size = fs.statSync(path).size;
	return size;
};
/**
 *
 * @param time 要睡眠的毫秒数
 */
const sleep = (time: number) => {
	const start = new Date().getTime();
	while (new Date().getTime() - start < time) {}
};
// 对文件进行操作，可与数据进行交互
export abstract class DataOperator<
	normal extends BasicData,
	bookmark extends BasicBookmark,
	folder extends BasicFolder
> {
	external = false;
	protected directories: normal[] = [];
	protected fileCache = {
		startPage: 0,
		data: [] as normal[]
	};
	protected prevPage = '';
	protected refreshFn: React.Dispatch<React.SetStateAction<boolean>> = (
		v: any
	) => {};
	protected setTitleFn: React.Dispatch<React.SetStateAction<string>> = (
		v: any
	) => {};

	protected mode: Mode = Mode.Init;
	protected total = 0;
	protected currentPacks = [] as normal[];
	dirMap = fromJS({}) as Map<string, DirectoryInfo>;
	protected readonly starModel: Model<normal>;
	protected readonly bookmarkModel: Model<bookmark>;
	protected selection = selectionModel;
	protected nextTitle = '';
	protected searchCache = {
		key: '',
		mode: Mode.Normal,
		res: [] as normal[],
		total: 0,
		reg: false,
		valid: false
	};

	protected constructor(
		protected databaseConfig: { database: string; tableName: string },
		protected sql: RequestOperator
	) {
		this.bookmarkModel = createBookmarkModel<bookmark>(this.sql);
		this.starModel = createStarModel<normal>(this.sql);
		(async () => {
			await this.sql.checkExternalDriver();
			this.sql.getCount().then((res) => {
				this.total = res;
			});
			this.sql.select<normal, folder>([], Mode.Star).then((res) => {
				this.starModel.data = res as normal[];
			});
			this.sql.select<normal, folder>([], Mode.Bookmark).then((res) => {
				this.bookmarkModel.data = res as unknown as bookmark[];
			});
			this.sql.select<normal, folder>([], Mode.ShowDirs).then((res) => {
				this.directories = res as normal[];
			});
			this.sql.mapDir().then((res) => {
				this.dirMap = Map(res);
			});
		})();
	}

	//获取图包
	protected async getPacksNormally(page: number) {
		let res = this.fileCache.data;
		if (
			this.switchMode(Mode.Normal) ||
			page < this.fileCache.startPage ||
			page >= this.fileCache.startPage + 10 ||
			this.fileCache.startPage === 0
		) {
			res = (await this.sql.select(
				[
					(page - 1) * packCountOfSinglePage,
					10 * packCountOfSinglePage
				],
				Mode.Normal
			)) as normal[];
			this.fileCache.data = res;
			this.fileCache.startPage = page;
		}
		this.currentPacks = this.fileCache.data;
		return this.currentPacks.slice(
			(page - this.fileCache.startPage) * packCountOfSinglePage,
			(page - this.fileCache.startPage + 1) * packCountOfSinglePage
		);
	}

	//搜索图包
	protected async searchPacks(key: string, page: number) {
		if (this.searchCache.key === key && this.searchCache.valid) {
			return this.searchCache.res.slice(
				(page - 1) * packCountOfSinglePage,
				page * packCountOfSinglePage
			);
		}
		this.searchCache.valid = true;
		this.searchCache.key = key;
		this.searchCache.res = [];
		this.searchCache.mode = this.mode;
		this.titleWillUpdate('Search=' + this.searchCache.key);
		let result = [] as normal[];
		if (this.mode === Mode.DirContent) {
			result = this.currentPacks.filter((v) => v.title.includes(key));
		} else {
			result = await this.sql.search(
				this.searchCache.reg ? convertJsRegToMysqlReg(key) : key,
				this.mode,
				this.searchCache.reg
			);
		}

		this.searchCache.res = result;
		this.searchCache.total = result.length;
		this.currentPacks = result;
		return this.currentPacks.slice(
			(page - 1) * packCountOfSinglePage,
			page * packCountOfSinglePage
		);
	}

	//获取星标图包
	protected getStared(page: number) {
		this.switchMode(Mode.Star);
		this.currentPacks = this.starModel.data;
		return this.currentPacks.slice(
			(page - 1) * packCountOfSinglePage,
			page * packCountOfSinglePage
		);
	}

	protected getBookmarks(page: number): [normal[], number] {
		this.switchMode(Mode.Bookmark);
		this.currentPacks = this.bookmarkModel.data as unknown as normal[];
		return [
			this.currentPacks.slice(
				(page - 1) * packCountOfSinglePage,
				page * packCountOfSinglePage
			),
			this.bookmarks.length
		];
	}
	//模式切换
	protected switchMode(mode: Mode) {
		if (mode !== Mode.Detail) {
			this.titleWillUpdate(this.modeType(mode));
		}

		if (mode === this.mode) {
			return false;
		}
		this.searchCache.valid = false;
		this.mode = mode;
		return true;
	}

	protected async getDirContent(
		index: number,
		page: number
	): Promise<[normal[], number]> {
		if (this.switchMode(Mode.DirContent)) {
			this.currentPacks = await this.sql.select([], Mode.DirContent);
		}
		return [
			this.currentPacks.slice(
				(page - 1) * packCountOfSinglePage,
				page * packCountOfSinglePage
			),
			this.currentPacks.length
		];
	}

	protected get bookmarks() {
		return this.bookmarkModel.data;
	}

	register(
		fn: React.Dispatch<React.SetStateAction<any>>,
		flag: boolean = false
	) {
		if (!flag) {
			this.refreshFn = fn;
		} else {
			this.setTitleFn = fn;
		}
	}

	abstract addNewPack(
		data:
			| { path: string; cover?: string; title: string }
			| { path: string; cover?: string; title: string }[],
		duplicate: boolean
	): void;

	updateStared(newStar: normal) {
		newStar.stared = !newStar.stared;
		this.starModel.update(newStar);
	}
	async showDir(page: number): Promise<[normal[], number]> {
		this.switchMode(Mode.ShowDirs);
		let res = await this.sql.select<normal, folder>([], Mode.ShowDirs);
		this.currentPacks = res as normal[];
		return [
			res.slice(
				(page - 1) * packCountOfSinglePage,
				page * packCountOfSinglePage
			) as unknown as normal[],
			res.length
		];
	}
	async getPacks(
		page: number,
		url: string,
		mode: Mode
	): Promise<[normal[], number]> {
		let query: {
			search?: string;
			directory?: string;
			stared?: string;
			bookmark?: string;
			show_dir?: string;
			page?: string;
			hashPath?: string;
		} = parseUrlQuery(url);
		if (
			!notMoreThanOne(
				query.stared,
				query.bookmark,
				query.directory,
				query.show_dir
			)
		) {
			// eslint-disable-next-line quotes
			throw new Error("can't more than one mode");
		}
		this.mode = mode;
		if (query.search) {
			return [
				await this.searchPacks(query.search, page),
				this.searchCache.total
			];
		} else if (query.directory) {
			return await this.getDirContent(parseInt(query.directory), page);
		} else if (mode === Mode.Star) {
			return [this.getStared(page), this.starModel.data.length];
		} else if (mode === Mode.Bookmark) {
			return this.getBookmarks(page);
		} else if (mode === Mode.ShowDirs) {
			return await this.showDir(page);
		}
		return [
			await this.getPacksNormally(page),
			this.total || (await this.getTotal())
		];
	}
	//修改窗口标题
	protected titleWillUpdate(title: string) {
		this.nextTitle = title;
	}

	titleUpdate() {
		this.setTitleFn(this.nextTitle);
	}
	//刷新
	refresh() {
		//this.switchMode(Mode.Init);
		this.refreshFn((v) => !v);
	}

	//保存前一页面
	savePrevPage(url: string) {
		this.prevPage = url;
	}

	loadPrevPage() {
		let url = this.prevPage;
		return url;
	}

	//获取当前要打开的页面
	abstract packWillOpen(packId: number, change: boolean): normal | null;

	async UpdateBookmark(newBookmark: bookmark, marked: boolean = true) {
		await this.bookmarkModel.update(newBookmark, marked);
		if (hasCover(newBookmark)) {
			await compress(
				newBookmark.path + newBookmark.cover,
				getBookmarkThumb(newBookmark)
			);
		}
	}

	//更新选区
	updateSelection(newSelection: number, selected: boolean) {
		this.selection.update(newSelection, selected);
	}

	addFileToDir(dirIndex: number) {
		if (this.selection.selected.size === 0) {
			return;
		}
		let cover = '';
		let count = 0;
		let n = 0;
		for (let i = 0; i < this.currentPacks.length; ++i) {
			const e = this.currentPacks[i];
			if (this.selection.selected.has(e.id)) {
				if (hasCover(e)) {
					cover = e.path + e.cover;
				}
				++n;
				if (n > 0 && n % 10 === 0) {
					sleep(100);
				}
				e.parent = dirIndex;
				this.sql
					.updateDir(dirIndex, e.id, 1, hasCover(e) ? cover : '')
					.then(() => {
						++count;
						if (count === this.selection.selected.size) {
							this.dirMap.get(dirIndex.toString())!.count +=
								this.selection.selected.size;
							this.selection.selected.clear();
							if (this.mode === Mode.Normal) {
								this.refresh();
							}
							this.switchMode(Mode.Init);
						}
					});
			}
		}
		this.currentPacks.forEach((e, i) => {});
	}

	abstract addNewDir(dirName: string): Promise<number>;
	removeFileFromDir(packId: number, dirId: number) {
		let e = this.currentPacks.find((e) => e.id !== packId);
		if (hasCover(e)) {
			this.sql
				.updateDir(
					dirId,
					packId,
					0,
					e ? e.path + e.cover : defaultCover
				)
				.then((e) => {
					this.dirMap.get(dirId.toString())!.count--;
					this.currentPacks = this.currentPacks.filter(
						(v) => v.id !== packId
					);
					this.refresh();
				});
		}
	}

	modeType(mode: Mode) {
		switch (mode) {
			case Mode.Init:
				return '首页';
			case Mode.Detail:
				return 'Detail';
			case Mode.Bookmark:
				return 'Bookmark';
			case Mode.ShowDirs:
				return 'Directories';
			case Mode.Star:
				return 'Stared';
			case Mode.DirContent:
				return (
					this.dirMap!.get(
						window.location.href.match(/directory=([0-9]+)/)![1]
					)?.title ?? 'Directories'
				);
			default:
				return '首页';
		}
	}

	protected renameTarget = { id: -1, oldTitle: '' };
	protected async renamePack(title: string) {
		try {
			await this.sql.renamePack(this.renameTarget.id, title);
			let target = this.currentPacks.find(
				(e) => e.id === this.renameTarget.id
			)!;
			target.title = title;
			if (target.stared) {
				this.starModel.update();
			}
			this.refresh();
			return true;
		} catch {
			return false;
		}
	}

	set packToBeRenamed(data: { id: number; oldTitle: string }) {
		if (data) {
			this.renameTarget = data;
		} else {
			this.renameTarget = { id: -1, oldTitle: '' };
		}
	}
	get oldTitle() {
		return this.renameTarget.oldTitle;
	}
	protected async renameDir(title: string) {
		try {
			await this.sql.renameDir(this.renameTarget.id, title);
			this.dirMap.get(this.renameTarget.id.toString())!.title = title;
			let target = this.currentPacks.find(
				(e) => e.id === this.renameTarget.id
			)!;
			target.title = title;
			this.refresh();
			return true;
		} catch (err) {
			console.error(err);
			return false;
		}
	}

	rename(newTitle: string) {
		if (this.mode === Mode.ShowDirs) {
			return this.renameDir(newTitle);
		}
		return this.renamePack(newTitle);
	}
	async getTotal() {
		return this.sql.getCount();
	}

	protected deletePack(packId: number) {
		return this.sql.delete(packId);
	}
	get modeOfSearch() {
		return this.searchCache.mode;
	}

	get inDir() {
		return this.mode === Mode.DirContent;
	}

	searchParentName(parentID: number | undefined) {
		if (!parentID) {
			return 'Directories';
		}
		return this.dirMap?.get(parentID.toString())?.title ?? 'Directories';
	}

	set reg(v: boolean) {
		this.searchCache.reg = v;
	}
	getMode() {
		return this.mode;
	}

	protected async load() {
		let promises = [] as Promise<any>[];
		promises.push(this.sql.mapDir());
		promises.push(this.sql.getCount());
		promises.push(this.sql.select<normal, folder>([], Mode.Star));
		promises.push(this.sql.select<normal, folder>([], Mode.Bookmark));
		promises.push(this.sql.select<normal, folder>([], Mode.ShowDirs));
		let [dirMap, total, stared, bookmark, showDir] = await Promise.all(
			promises
		);
		this.dirMap = Map(dirMap);
		this.total = total;
		this.starModel.data = stared;
		this.bookmarkModel.data = bookmark;
		this.directories = showDir;
		return true;
	}

	async clearBookmark() {
		return this.sql.clearBookmark().then(() => {
			this.bookmarkModel.clear();
		});
	}
	removePack(pack: normal, shouldDelete = false) {
		if (pack.parent) {
			this.removeFileFromDir(pack.id, pack.parent);
		}

		this.currentPacks = this.currentPacks.filter((e) => e.id !== pack.id);
		this.starModel.remove(pack.id);
		this.bookmarkModel.remove(pack.id);
		this.searchCache.res = this.searchCache.res.filter(
			(e) => e.id !== pack.id
		);
		this.deletePack(pack.id).then(() => {
			this.refresh();
		});
	}
	getProgress(id: number) {
		return this.bookmarkModel.data.find((v) => v.id === id)?.url;
	}
}
