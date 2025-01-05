/* eslint-disable camelcase */
/* eslint-disable new-cap */
/* eslint-disable no-unused-vars */
import {
  ImageBookmark,
  ImageDirectory,
  InsertResult,
  Mode,
  NormalImage,
} from '../../types/global';
import { compress } from '../functions/compressThumb';
import { endsWith, rmDir } from '../functions/functions';
import {
  SqliteOperatorForGallery,
  sqliteOperatorForGallery,
} from '../sql/sqliteOperatorForGallery';
import { DataOperator } from './DataOperator';
const fs = window.require('fs');
const isImage = (v: string) =>
  endsWith(v.toLocaleLowerCase(), '.jpg', 'png', 'jpeg', 'webp');
const isValidImage = (v: string) => {
  const stat = fs.statSync(v);
  return stat.size > 1024;
};

// 对文件进行操作，可与数据进行交互
export class GalleryOperator extends DataOperator<
  NormalImage,
  ImageBookmark,
  ImageDirectory
> {
  protected static instance: GalleryOperator;
  protected override sql: SqliteOperatorForGallery;
  currentDirectory: number = -1;
  static getInstance(): GalleryOperator {
    if (!GalleryOperator.instance) {
      GalleryOperator.instance = new GalleryOperator();
    }
    return GalleryOperator.instance;
  }

  protected constructor() {
    super(
      { database: 'GALLERY', tableName: 'pack_list' },
      sqliteOperatorForGallery,
    );
    this.sql = sqliteOperatorForGallery;
  }

  async changePackCover(packId: string, cover: string, fullPath: string) {
    compress(fullPath);
    const e = this.currentPacks.find((e) => e.id === parseInt(packId))!;
    await this.sql.changePackCover(e?.id, cover);
    e.cover = cover;
    if (e.stared) {
      this.starModel.update();
    }
  }

  async addNewPack(
    data:
      | { path: string; cover?: string; title: string }
      | { path: string; cover?: string; title: string }[],
    duplicate: boolean = false,
  ) {
    if (!Array.isArray(data)) {
      if (!data.path || !data.title) {
        return;
      }
      let cover = data.cover;
      if (!cover || !isImage(cover)) {
        cover = fs.readdirSync(data.path).find((v: string) => isImage(v));
      }
      if (!cover) {
        console.warn(data.title, 'no image found');
        return;
      }
      const newPack = {
        path: data.path,
        cover: cover.startsWith('/') ? cover : '/' + cover,
        title: data.title,
        stared: 0 as const,
      };
      await this.sql.insertPack(newPack, duplicate);
      const img = newPack.path + newPack.cover;
      await compress(img);
      this.switchMode(Mode.Init);
      this.refresh();
      return true;
    }
    const result = [] as InsertResult[];
    let successCount = 0;
    const success = [] as Promise<any>[];
    data.forEach((e, i) => {
      if (!e.path || !e.title) {
        return;
      }
      const cover =
        e.cover || fs.readdirSync(e.path).find((v: string) => isImage(v));
      if (!cover) {
        console.warn(e.title, 'no image found');
        result.push({
          title: e.title,
          type: '未找到图片',
        });
        return;
      }
      const newPack = {
        path: e.path,
        cover: cover.startsWith('/') ? cover : '/' + cover,
        title: e.title,
        stared: 0 as const,
      };
      const img = newPack.path + newPack.cover;
      if (!isValidImage(img)) {
        const files = fs.readdirSync(e.path);
        const valid = files.find((v: string) => isValidImage(e.path + v));
        if (!valid) {
          result.push({
            title: e.title,
            type: '图片无效',
          });
          return;
        }
        newPack.cover = '/' + valid || '';
      }
      success.push(
        this.sql.insertPack(newPack, false).then((res) => {
          if (!res) {
            result.push({
              title: e.title,
              type: '重复',
            });
          } else {
            successCount++;
            result.push({
              title: e.title,
              type: '成功',
            });
          }
          compress(img).then(() => {
            if (i === data.length - 1 && successCount) {
              this.switchMode(Mode.Init);
              this.refresh();
            }
          });
        }),
      );
    });
    return Promise.all(success).then(() => {
      return result;
    });
  }
  async addNewDir(dirName: string) {
    // if (this.dirMap.valueSeq().find((v) => v.title === dirName)) {
    // 	return -1;
    // }
    for (const key of this.dirMap.keys()) {
      if (this.dirMap.get(key)!.title === dirName) {
        return -Number(key);
      }
    }
    const newDirectory = {
      dir_title: dirName,
    };
    const res = await this.sql.insertDir(newDirectory);
    if (res) {
      this.dirMap = await this.sql.mapDir();
      this.switchMode(Mode.Init);
      return res;
    }
    return -1;
  }

  getPackImages(id: string) {
    return this.currentPacks.find((e) => e.id === parseInt(id));
  }

  removePack(pack: NormalImage, shouldDelete = false) {
    if (pack.parent) {
      this.removeFileFromDir(pack.id, pack.parent);
    }
    this.deletePack(pack.id);
    this.currentPacks = this.currentPacks.filter((e) => e.id !== pack.id);
    this.starModel.remove(pack.id);
    this.bookmarkModel.remove(pack.id);
    this.searchCache.res = this.searchCache.res.filter((e) => e.id !== pack.id);
    if (shouldDelete) {
      rmDir(pack.path).then(() => {
        this.refresh();
      });
    } else {
      this.refresh();
    }
  }
}

export const galleryOperator = GalleryOperator.getInstance();
