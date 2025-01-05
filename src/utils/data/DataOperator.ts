/* eslint-disable camelcase */
/* eslint-disable new-cap */
/* eslint-disable no-unused-vars */
import {
  defaultCover,
  getBookmarkThumb,
  packCountOfSinglePage,
} from '../../types/constant';
import {
  BasicBookmark,
  BasicData,
  BasicFolder,
  DirectoryInfo,
  Mode,
  Model,
} from '../../types/global';
import { compress } from '../functions/compressThumb';
import { convertJsRegToMysqlReg } from '../functions/functions';
import { hasCover } from '../functions/typeAssertion';
import {
  createBookmarkModel,
  createStarModel,
  selectionModel,
} from '../models';
import { RequestOperator } from '../sql/requestOperator';
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
  folder extends BasicFolder,
> {
  external = false;
  protected directories: normal[] = [];
  protected fileCache = {
    startPage: 0,
    data: [] as normal[],
  };
  protected prevPage = '';
  protected refreshFn: any = (_v: any) => {};
  protected setTitleFn: any = (_v: any) => {};

  protected mode: Mode = Mode.Init;
  protected total = 0;
  protected currentPacks = [] as normal[];
  protected dirMap = new Map() as Map<string, DirectoryInfo>;
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
    valid: false,
    dirId: -1,
  };
  private currentDir = -1;

  protected constructor(
    protected databaseConfig: { database: string; tableName: string },
    protected sql: RequestOperator,
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
      this.sql.select<normal, folder>([], Mode.Folder).then((res) => {
        this.directories = res as normal[];
      });
      this.sql.mapDir().then((res) => {
        this.dirMap = res;
      });
    })();
  }

  //获取图包
  protected async getPacksNormally(page: number) {
    let res = this.fileCache.data;
    res = (await this.sql.select(
      [(page - 1) * packCountOfSinglePage, 10 * packCountOfSinglePage],
      Mode.Normal,
    )) as normal[];
    this.fileCache.data = res;
    this.fileCache.startPage = page;
    this.currentPacks = this.fileCache.data;
    return this.currentPacks.slice(
      (page - this.fileCache.startPage) * packCountOfSinglePage,
      (page - this.fileCache.startPage + 1) * packCountOfSinglePage,
    );
  }

  //搜索图包
  protected async searchPacks(key: string, page: number, dirId: number = -1) {
    if (
      this.searchCache.key === key &&
      this.searchCache.mode === this.mode &&
      this.searchCache.dirId === dirId
    ) {
      return this.searchCache.res.slice(
        (page - 1) * packCountOfSinglePage,
        page * packCountOfSinglePage,
      );
    }
    this.searchCache.valid = true;
    this.searchCache.key = key;
    this.searchCache.res = [];
    this.searchCache.mode = this.mode;
    this.searchCache.dirId = dirId;
    let result = [] as normal[];
    if (this.mode === Mode.DirContent) {
      result = this.currentPacks.filter((v) => v.title.includes(key));
    } else {
      result = await this.sql.search(
        this.searchCache.reg ? convertJsRegToMysqlReg(key) : key,
        this.mode,
        this.searchCache.reg,
      );
    }

    this.searchCache.res = result;
    this.searchCache.total = result.length;
    this.currentPacks = result;
    return this.currentPacks.slice(
      (page - 1) * packCountOfSinglePage,
      page * packCountOfSinglePage,
    );
  }

  //获取星标图包
  protected getStared(page: number) {
    this.switchMode(Mode.Star);
    this.currentPacks = this.starModel.data;
    return this.currentPacks.slice(
      (page - 1) * packCountOfSinglePage,
      page * packCountOfSinglePage,
    );
  }

  protected getBookmarks(page: number): [normal[], number] {
    this.switchMode(Mode.Bookmark);
    this.currentPacks = this.bookmarkModel.data as unknown as normal[];
    return [
      this.currentPacks.slice(
        (page - 1) * packCountOfSinglePage,
        page * packCountOfSinglePage,
      ),
      this.bookmarks.length,
    ];
  }
  //模式切换
  protected switchMode(mode: Mode) {
    // if (mode !== Mode.Detail) {
    //   this.titleWillUpdate(this.modeType(mode));
    // }
    if (mode !== Mode.DirContent) {
      this.currentDir = -1;
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
    page: number,
    dirId?: number,
  ): Promise<[normal[], number]> {
    this.switchMode(Mode.DirContent);
    this.currentDir = dirId!;
    this.currentPacks = await this.sql.select([], Mode.DirContent, {
      dirId,
    });
    return [
      this.currentPacks.slice(
        (page - 1) * packCountOfSinglePage,
        page * packCountOfSinglePage,
      ),
      this.currentPacks.length,
    ];
  }

  protected get bookmarks() {
    return this.bookmarkModel.data;
  }

  abstract addNewPack(
    data:
      | { path: string; cover?: string; title: string }
      | { path: string; cover?: string; title: string }[],
    duplicate: boolean,
  ): void;

  updateStared(newStar: normal) {
    newStar.stared = !newStar.stared;
    this.starModel.update(newStar);
  }
  async showDir(page: number): Promise<[normal[], number]> {
    // this.switchMode(Mode.Folder);
    let res = await this.sql.select<normal, folder>([], Mode.Folder);
    this.currentPacks = res as normal[];
    return [
      res.slice(
        (page - 1) * packCountOfSinglePage,
        page * packCountOfSinglePage,
      ) as unknown as normal[],
      res.length,
    ];
  }
  async getPacks(
    page: number,
    mode: Mode,
    options?: { search?: string; dirId?: number },
  ): Promise<[normal[], number]> {
    const { search, dirId } = options || {};
    this.mode = mode;
    if (search) {
      return [
        await this.searchPacks(search || '', page, dirId || -1),
        this.searchCache.total,
      ];
    } else if (mode === Mode.DirContent) {
      return await this.getDirContent(1, page, dirId);
    } else if (mode === Mode.Star) {
      return [this.getStared(page), this.starModel.data.length];
    } else if (mode === Mode.Bookmark) {
      return this.getBookmarks(page);
    } else if (mode === Mode.Folder) {
      return await this.showDir(page);
    }
    return [
      await this.getPacksNormally(page),
      this.total || (await this.getTotal()),
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

  async UpdateBookmark(newBookmark: bookmark, marked: boolean = true) {
    await this.bookmarkModel.update(newBookmark, marked);
    if (hasCover(newBookmark)) {
      await compress(
        newBookmark.path + newBookmark.cover,
        getBookmarkThumb(newBookmark),
      );
    }
  }

  //更新选区
  updateSelection(newSelection: number, selected: boolean) {
    this.selection.update(newSelection, selected);
  }

  async addFileToDir(dirIndex: number, selected: number[]) {
    for (let i = 0; i < selected.length; ++i) {
      const e = selected[i];
      const pack = this.currentPacks.find((v) => v.id === e);
      if (pack) {
        pack.parent = dirIndex;
      }
      await this.sql.updateDir(dirIndex, e, 1, '');
    }
    this.dirMap = await this.sql.mapDir();
    this.switchMode(Mode.Init);
    return;
  }

  abstract addNewDir(dirName: string): Promise<number>;

  removeFileFromDir(packId: number, dirId: number) {
    let e = this.currentPacks.find((e) => e.id !== packId);
    if (hasCover(e)) {
      return this.sql
        .updateDir(dirId, packId, 0, e ? e.path + e.cover : defaultCover)
        .then((e) => {
          this.dirMap.get(dirId.toString())!.count--;
          const item =
            this.currentPacks.find((v) => v.id === packId) ||
            this.searchCache.res.find((v) => v.id === packId);
          const stared = this.starModel.data.find((v) => v.id === packId);
          stared && (stared.parent = undefined);
          if (!item) return;
          item.parent = undefined;
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
      case Mode.Folder:
        return 'Directories';
      case Mode.Star:
        return 'Stared';
      case Mode.DirContent:
        return (
          this.dirMap!.get(window.location.href.match(/directory=([0-9]+)/)![1])
            ?.title ?? 'Directories'
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
        (e) => e.id === this.renameTarget.id,
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
        (e) => e.id === this.renameTarget.id,
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
    if (this.mode === Mode.Folder) {
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

  getDirMap() {
    return this.dirMap;
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
    promises.push(this.sql.select<normal, folder>([], Mode.Folder));
    let [dirMap, total, stared, bookmark, showDir] =
      await Promise.all(promises);
    this.dirMap = dirMap;
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
  removePack(pack: normal) {
    if (pack.parent) {
      this.removeFileFromDir(pack.id, pack.parent);
    }

    this.currentPacks = this.currentPacks.filter((e) => e.id !== pack.id);
    this.starModel.remove(pack.id);
    this.bookmarkModel.remove(pack.id);
    this.searchCache.res = this.searchCache.res.filter((e) => e.id !== pack.id);
    this.deletePack(pack.id).then(() => {
      this.refresh();
    });
  }
  getProgress(id: number) {
    return this.bookmarkModel.data.find((v) => v.id === id)?.url;
  }
}
