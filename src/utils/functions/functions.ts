import img from '../../assets/photo.png';
import { magicCode } from '../../types/constant';

const fs = window.require('fs');
const crypto = window.require('crypto');
export const path = window.require('path');
export const Buffer = window.require('buffer').Buffer;
export function formatDate(
  time: string | number | Date,
  format = 'YY-MM-DD hh:mm:ss',
) {
  let date = new Date(time);

  let year = date.getFullYear(),
    month = date.getMonth() + 1, //月份是从0开始的
    day = date.getDate(),
    hour = date.getHours(),
    min = date.getMinutes(),
    sec = date.getSeconds();
  let preArr = [...Array(10)].map(function (elem, index) {
    return '0' + index;
  });

  let newTime = format
    .replace(/YY/g, year.toString())
    .replace(/MM/g, preArr[month] || month.toString())
    .replace(/DD/g, preArr[day] || day.toString())
    .replace(/hh/g, preArr[hour] || hour.toString())
    .replace(/mm/g, preArr[min] || min.toString())
    .replace(/ss/g, preArr[sec] || sec.toString());

  return newTime;
}
export const notMoreThanOne = (...arr: any[]) => {
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      count++;
    }
  }
  return count <= 1;
};

export const parseUrlQuery = (url: string) => {
  const [hashPath, query] = url
    .split('?')
    .slice(0, 2)
    .map((e) => decodeURIComponent(e));
  if (query) {
    const queryObj: any = {};
    const queryArr = query.split('&');
    queryArr.forEach((item) => {
      const [key, value] = item.split('=');
      if (typeof value === 'string') {
        queryObj[key] = value;
      }
    });
    return queryObj;
  }
  return {};
};
export const convertJsRegToMysqlReg = (reg: string) => {
  let newReg = '';
  newReg = String.raw`${reg}`
    .replace('\\d', '[0-9]')
    .replace('\\w', '[a-zA-Z]')
    .replace(/\[.*(\[0-9\]).*\]/, (match, p1) => {
      return match.replace(p1, '0-9');
    })
    .replace(/\[.*(\[a-zA-Z\]).*\]/, (match, p1) => {
      return match.replace(p1, 'a-zA-Z');
    });
  return String.raw`${newReg}`;
};
export const endsWith = (str: string, ...args: string[]) => {
  for (let i = 0; i < args.length; i++) {
    if (str.endsWith(args[i])) {
      return true;
    }
  }
  return false;
};

export const setSearchParams = (head: string, params: any) => {
  let search = '';
  for (let key in params) {
    if (params[key]) {
      search += `${key}=${params[key]}&`;
    }
  }
  return `${head}?${search}`;
};

export const deleteUselessWords = (str: string, ...useless: string[]) => {
  useless.forEach((v) => {
    str = str.replace(v, '');
  });
  return str;
};

export const gotoHash = (hash: string) => {
  window.location.hash = hash;
};
export const rmDir = async (dirPath: string) => {
  let files = [];
  try {
    files = fs.readdirSync(dirPath);
  } catch (e) {
    return false;
  }
  if (files.length > 0)
    for (let i = 0; i < files.length; i++) {
      let filePath = dirPath + '/' + files[i];
      if (fs.statSync(filePath).isFile()) fs.unlinkSync(filePath);
      else rmDir(filePath);
    }
  await fs.rmdir(dirPath, (err) => {
    if (err) {
      console.error(err);
    }
  });
  return true;
};

export const stylesJoin = (...args: string[]) => {
  return args.join(' ');
};
const between = (value: number, num1: number, num2: number) => {
  return value >= Math.min(num1, num2) && value <= Math.max(num1, num2);
};
export const verified = () => {
  return window.localStorage.getItem('magicCode') === magicCode;
};

export const generateFileMd5 = (filePath: string): string => {
  const md5 = crypto.createHash('md5');
  const content = fs.readFileSync(filePath);
  return md5.update(content).digest('hex');
};

export const generateTextMd5 = (text: string): string => {
  const md5 = crypto.createHash('md5');
  return md5.update(text).digest('hex');
};

export function debounce(fn: (...args) => any, delay: number) {
  let timer: any = null;
  // eslint-disable-next-line no-unused-vars
  return function (this: any, ...args: any[]) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export const notification = (title, body) => {
  new Notification(title, {
    body: body,
    icon: img,
  });
};

export const buildUrl = (baseUrl: string, params: Record<string, any>) => {
  const search = new URLSearchParams(params).toString();
  return `${baseUrl}?${search}`;
};

export const range = (from: number, to: number) => {
  const arr = [] as number[];
  for (let i = from; i < to; ++i) {
    arr.push(i);
  }
  return arr;
};

export const getLegalUrl = (url: string) => {
  return String.raw`${url.replace(/\\/g, '/')}`
    .replaceAll(/%/g, encodeURIComponent('%'))
    .replaceAll(/\s/g, encodeURIComponent(' '))
    .replaceAll(/#/g, encodeURIComponent('#'));
};
