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

// torrent/:id return a single torrent in this format
export type TorrentType = {
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
};

export type TorrentCardProp = {
  id: number;
  title: string;
  infoHash: string;
  size: number;
  category: Category;
  languages: string[] | null;
  completedCount: number | null;
  createdAt: Date;
  seedCount: number;
  leechCount: number;
};

// /recent_torrents, /my_torrents and /search/q return data in this format
export type BatchGetFromApiType = {
  torrents: {
    id: number;
    title: string;
    infoHash: string;
    size: number;
    category: Category;
    languages: string[] | null;
    completedCount: number | null;
    createdAt: Date;
  }[];
  stat: {
    infoHash: string;
    seedCount: number;
    leechCount: number;
  }[];
};
