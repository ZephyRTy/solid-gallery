const sq3 = window.require('sqlite3');
const path = window.require('path');
const fs = window.require('fs');
const os = window.require('os');

export class BaseRepository {
  protected db: any;
  protected dbPath: string;

  constructor(dbName: string) {
    const dir = path.resolve(
      os.userInfo().homedir,
      'AppData',
      'Roaming',
      'y-Reader',
    );
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    this.dbPath = path.resolve(dir, dbName);
  }

  protected open(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sq3.Database(this.dbPath, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  protected query<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err: any, rows: T[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  protected get<T>(sql: string, params: any[] = []): Promise<T | null> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err: any, row: T | undefined) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ?? null);
        }
      });
    });
  }

  protected run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  protected exec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}
