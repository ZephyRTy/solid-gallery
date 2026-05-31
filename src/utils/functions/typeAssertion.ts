import { ImageDirectory } from '../../types/global';

export const isImageDir = (data: any): data is ImageDirectory => {
  return !data.url && !!data.timeStamp && !!data.cover;
};

export const isBookDir = (data: any): data is ImageDirectory => {
  return !data.url && !!data.timeStamp && !data.cover;
};

export const hasCover = (data: any): data is { cover: string } => {
  return data.cover !== undefined;
};
