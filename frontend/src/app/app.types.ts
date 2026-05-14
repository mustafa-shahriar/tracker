export type Category =
  | 'movie'
  | 'series'
  | 'anime'
  | 'documentary'
  | 'game'
  | 'software'
  | 'music'
  | 'book'
  | 'ebook'
  | 'audiobook'
  | 'course'
  | 'tutorial'
  | 'other';

export interface TorrentType {
  id: number;
  title: string;
  description: string | null;
  size: number;
  infoHash: string;
  coverImgUrl: string | null;
  category: Category;
  languages: string[] | null;
  subtitles: string[] | null;
  completedCount: number | null;
  createdAt: Date;
  seedCount: number;
  leechCount: number;
}
