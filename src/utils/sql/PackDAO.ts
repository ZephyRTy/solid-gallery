import { Mode, NormalImage } from '../../types/global';
import { formatDate } from '../functions/functions';
import { getAllDrive } from '../functions/process';
import { BaseRepository } from './BaseRepository';

export class PackDAO extends BaseRepository {
  private drivers: string[] = [];
  private loaded = false;
  private hasExternalDriver = true;

  constructor() {
    super('gallery.db');
  }

  async init(): Promise<void> {
    await this.open();
    await this.initializeTables();
    await this.checkExternalDriver();
  }

  private initializeTables(): Promise<void> {
    const stmt1 = `CREATE TABLE if not exists directory (
      dir_id integer PRIMARY KEY AUTOINCREMENT ,
      dir_title varchar(255) NOT NULL,
      cover_id integer,
      update_time timestamp NULL DEFAULT CURRENT_TIMESTAMP
    )`;
    const stmt2 = `CREATE TABLE if not exists pack_list (
      id integer  PRIMARY KEY AUTOINCREMENT ,
      title varchar(255) NOT NULL,
      path varchar(255) NOT NULL unique,
      stared tinyint(1) NOT NULL DEFAULT '0',
      parent int unsigned DEFAULT NULL,
      cover varchar(255),
      CONSTRAINT fk_pack_id FOREIGN KEY (parent) REFERENCES directory (dir_id) ON DELETE SET NULL ON UPDATE CASCADE
    ) `;
    const stmt3 = `CREATE TABLE if not exists bookmark (
      b_id int NOT NULL,
      b_timeStamp timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      b_url varchar(255) NOT NULL,
      b_cover varchar(255),
      PRIMARY KEY (b_id),
      CONSTRAINT bookmark_ibfk_1 FOREIGN KEY (b_id) REFERENCES pack_list (id) ON DELETE CASCADE ON UPDATE CASCADE
    )`;
    return Promise.all([
      this.exec(stmt1),
      this.exec(stmt2),
      this.exec(stmt3),
    ]).then(() => {});
  }

  async checkExternalDriver(): Promise<boolean> {
    if (this.loaded) {
      return this.hasExternalDriver;
    }
    const drives = await getAllDrive();
    this.drivers = drives.map((v) => v.drive);
    this.hasExternalDriver = true;
    this.loaded = true;
    return this.hasExternalDriver;
  }

  private getDriverSql(): string {
    let sql = '';
    this.drivers.forEach((v, i) => {
      sql += `path like '${v}%' `;
      if (i !== this.drivers.length - 1) {
        sql += 'or ';
      }
    });
    if (sql) {
      sql = `(${sql}) and `;
    }
    return sql;
  }

  async select<Pack = NormalImage>(
    sqlParam: number[],
    mode: Mode,
    options?: Record<string, string>,
  ): Promise<Pack[]> {
    if (mode === Mode.Normal && sqlParam.length !== 2) {
      throw new Error('sqlParam is not correct');
    }
    const driverSql = this.getDriverSql();
    let sql = `select * from pack_list where ${driverSql} parent is null order by id desc limit ?,?`;
    let dirId = '';

    switch (mode) {
      case Mode.Normal:
        sql = `select * from pack_list where ${driverSql} parent is null order by id desc limit ?,?`;
        break;
      case Mode.Star:
        sql = `select * from pack_list where ${driverSql} stared = 1 order by id desc`;
        break;
      case Mode.DirContent:
        dirId = options!.dirId;
        sql = `select * from pack_list where ${driverSql} parent = ? order by id desc`;
        return this.query(sql, [dirId]).then((rows: any[]) =>
          rows.map(
            (v: any) =>
              ({
                id: v.id,
                title: v.title,
                path: v.path,
                cover: v.cover,
                stared: Boolean(v.stared),
                parent: v.parent,
                reg: v.reg,
              }) as unknown as Pack,
          ),
        );
      case Mode.Folder:
        sql = `select * from directory,pack_list where cover_id = id order by update_time desc`;
        return this.query(sql).then((rows: any[]) =>
          rows.map(
            (v: any) =>
              ({
                id: v.dir_id,
                title: v.dir_title,
                cover: v.path + v.cover,
                timeStamp: formatDate(new Date(v.update_time).toString()) ?? '',
              }) as unknown as Pack,
          ),
        );
      default:
        sql = `select * from pack_list where ${driverSql} parent is not null order by id desc limit ?,?`;
    }

    return this.query(sql, sqlParam).then((rows: any[]) =>
      rows.map(
        (v: any) =>
          ({
            id: v.id ?? v.dir_id,
            title: v.title ?? v.dir_title,
            path: v.path ?? '',
            cover: v.cover ?? v.dir_cover,
            stared: Boolean(v.stared ?? v.dir_stared),
            parent: v.parent,
            reg: v.reg,
          }) as unknown as Pack,
      ),
    );
  }

  getCount(): Promise<number> {
    const driverSql = this.getDriverSql();
    const sql = `select count(*) as count from pack_list where ${driverSql} parent is null`;
    return this.get<{ count: number }>(sql).then((row) => row?.count || 0);
  }

  async search<T extends { id: number }>(
    sqlParam: string,
    mode: Mode,
    reg: boolean,
  ): Promise<T[]> {
    const driverSql = this.getDriverSql();
    let key = reg ? `regexp '${sqlParam}' ` : `like '%${sqlParam}%'`;

    let sql = '';
    switch (mode) {
      case Mode.Normal:
        sql = `select * from pack_list where ${driverSql} title ${key} order by id desc`;
        break;
      case Mode.Star:
        sql = `select * from pack_list where ${driverSql} stared = 1 and title ${key} order by id desc`;
        break;
      case Mode.DirContent: {
        const dirId = window.location.href.match(/directory=([0-9]+)/)![1];
        sql = `select * from pack_list where ${driverSql} parent = ${dirId} and title ${key} order by id desc`;
        break;
      }
      case Mode.Folder:
        sql = `select * from directory, pack_list where ${driverSql} dir_title ${key} and directory.cover_id = pack_list.id order by update_time desc`;
        break;
      default:
        sql = `select * from pack_list where ${driverSql} title ${key} order by id desc`;
    }

    return this.query(sql).then((rows: any[]) =>
      rows.map(
        (v: any) =>
          ({
            id: v.dir_id ?? v.id,
            title: v.dir_title ?? v.title,
            path: mode === Mode.Folder ? '' : v.path,
            cover: mode === Mode.Folder ? v.path + v.cover : v.cover,
            stared: Boolean(v.stared ?? v.dir_stared),
            parent: v.parent,
            reg: v.reg,
            timeStamp: v.update_time,
          }) as unknown as T,
      ),
    );
  }

  updateStar(id: number, stared: boolean): Promise<void> {
    return this.run('update pack_list set stared = ? where id = ?', [
      stared ? 1 : 0,
      id,
    ]);
  }

  updateDir(
    dirId: number,
    packId: number,
    status: 0 | 1,
    cover?: string,
  ): Promise<void> {
    if (status) {
      this.run(
        'update directory set cover_id = ?, update_time = CURRENT_TIMESTAMP where dir_id = ?',
        [packId, dirId],
      ).catch((err) => console.error(err));
    } else {
      this.run(
        `WITH t AS (
          SELECT id, title, parent
          FROM pack_list
          WHERE id IN (
            SELECT max(id)
            FROM pack_list
            WHERE parent > 0
            GROUP BY parent
            HAVING id != ?
          )
        )
        UPDATE directory
        SET cover_id = t.id
        FROM t
        WHERE directory.dir_id = ? AND t.parent = directory.dir_id`,
        [packId, dirId],
      ).catch((err) => console.error(err));
    }
    return this.run('update pack_list set parent = ? where id = ?', [
      status ? dirId : null,
      packId,
    ]);
  }

  mapDir(): Promise<
    Map<string, { title: string; count: number; updateTime: number }>
  > {
    const sql = `select dir_id as id, dir_title as title , count(parent) as count, update_time as updateTime from directory left outer join pack_list on (dir_id = parent) group by dir_id`;
    return this.query<any>(sql).then((rows) => {
      const map = new Map<
        string,
        { title: string; count: number; updateTime: number }
      >();
      rows.forEach((v: any) => {
        map.set(v.id.toString(), {
          count: v.count,
          title: v.title,
          updateTime: new Date(v.updateTime).getTime(),
        });
      });
      return map;
    });
  }

  insertDir(dirTitle: string): Promise<number | null> {
    return this.get<{ lastID: number }>(
      'insert into directory (dir_title, update_time) values (?,?)',
      [dirTitle, formatDate(new Date())],
    )
      .then(() => {
        return this.get<{ seq: number }>(
          'select last_insert_rowid() as seq',
        ).then((row) => row?.seq ?? null);
      })
      .catch((err) => {
        console.error(err);
        return null;
      });
  }

  insertPack(
    title: string,
    stared: 0 | 1,
    path: string,
    cover?: string,
  ): Promise<void> {
    return this.run(
      'insert into pack_list (title, path, stared, cover) values (?,?,?,?)',
      [title, path, stared, cover],
    );
  }

  deletePack(id: number): Promise<void> {
    return this.run('delete from pack_list where id = ?', [id]);
  }

  renamePack(id: number, title: string): Promise<void> {
    return this.run('update pack_list set title = ? where id = ?', [title, id]);
  }

  renameDir(id: number, title: string): Promise<void> {
    return this.run('update directory set dir_title = ? where dir_id = ?', [
      title,
      id,
    ]);
  }

  changePackCover(id: number, cover: string): Promise<void> {
    return this.run('update pack_list set cover = ? where id = ?', [cover, id]);
  }

  updateReg(id: number, reg: string): Promise<void> {
    return this.run('update pack_list set reg = ? where id = ?', [reg, id]);
  }

  getPackById(id: number): Promise<any> {
    return this.get<any>('select * from pack_list where id = ?', [id]).then(
      (v) => {
        if (!v) {
          throw new Error('not found');
        }
        return {
          id: v.id,
          title: v.title,
          path: v.path,
          cover: v.cover,
          stared: Boolean(v.stared),
          parent: v.parent,
          reg: v.reg,
        };
      },
    );
  }
}
