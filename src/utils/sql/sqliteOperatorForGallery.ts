import {
  BasicData,
  DirectoryInfo,
  ImageDirectory,
  Mode,
  NormalImage,
} from '../../types/global';
import { RequestOperator } from './requestOperator';
import { PackDAO } from './PackDAO';

const sq3 = window.require('sqlite3');
const path = window.require('path');
const fs = window.require('fs');
const os = window.require('os');

export class SqliteOperatorForGallery implements RequestOperator {
  private static _instance: SqliteOperatorForGallery;
  private dao: PackDAO;
  private db: any;
  private _pool: any;
  count: number = 0;
  private initDone = false;
  private drivers: string[] = [];

  private constructor() {
    const dbPath = path.resolve(
      os.userInfo().homedir,
      'AppData',
      'Roaming',
      'y-Reader',
    );
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath);
    }
    this.db = new sq3.Database(path.resolve(dbPath, 'gallery.db'));
    this.dao = new PackDAO();
  }

  static getInstance(): SqliteOperatorForGallery {
    if (!SqliteOperatorForGallery._instance) {
      SqliteOperatorForGallery._instance = new SqliteOperatorForGallery();
    }
    return SqliteOperatorForGallery._instance;
  }

  private async ensureInit(): Promise<void> {
    if (!this.initDone) {
      await this.dao.init();
      this.initDone = true;
    }
  }

  async checkExternalDriver() {
    return this.dao.checkExternalDriver();
  }

  getPackById(id: number) {
    return this.dao.getPackById(id);
  }

  switchDatabase() {
    return true;
  }

  async select<Pack = NormalImage, Folder = ImageDirectory>(
    sqlParam: number[],
    mode: Mode,
    options?: Record<string, string>,
  ): Promise<Pack[] | Folder[]> {
    await this.ensureInit();
    return this.dao.select(sqlParam, mode, options) as Promise<
      Pack[] | Folder[]
    >;
  }

  async getCount(): Promise<number> {
    await this.ensureInit();
    return this.dao.getCount();
  }

  end() {
    this.dao.close();
    if (this.db) {
      this.db.close();
    }
  }

  async search<T extends BasicData>(
    sqlParam: string,
    mode: Mode,
    reg: boolean,
  ): Promise<T[]> {
    await this.ensureInit();
    return this.dao.search(sqlParam, mode, reg) as Promise<T[]>;
  }

  async updateStar<T extends BasicData>(data: T) {
    await this.ensureInit();
    return this.dao.updateStar(data.id, data.stared);
  }

  async updateDir(
    dirId: number,
    packId: number,
    status: 0 | 1,
    cover?: string,
  ) {
    await this.ensureInit();
    return this.dao.updateDir(dirId, packId, status, cover);
  }

  mapDir(): Promise<Map<string, DirectoryInfo>> {
    return this.dao.mapDir();
  }

  insertDir(newDir: { dir_title: string }): Promise<number | null> {
    return this.dao.insertDir(newDir.dir_title);
  }

  insertPack(
    newPack: {
      title: string;
      stared: 0 | 1;
      path: string;
      cover?: string;
    },
    _duplicate: boolean = false,
  ) {
    return this.dao.insertPack(
      newPack.title,
      newPack.stared,
      newPack.path,
      newPack.cover,
    );
  }

  updateReg(id: number, reg: string) {
    return this.dao.updateReg(id, reg);
  }

  renamePack(packID: number, title: string) {
    return this.dao.renamePack(packID, title);
  }

  renameDir(dirID: number, title: string) {
    return this.dao.renameDir(dirID, title);
  }

  changePackCover(packID: number, cover: string) {
    return this.dao.changePackCover(packID, cover);
  }

  delete(packID: number) {
    return this.dao.deletePack(packID);
  }

  clearBookmark(): Promise<unknown> {
    return Promise.resolve();
  }
}

export const sqliteOperatorForGallery = SqliteOperatorForGallery.getInstance();
