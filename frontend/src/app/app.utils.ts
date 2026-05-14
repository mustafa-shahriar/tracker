import { BatchGetFromApiType, TorrentCardProp } from './app.types';

export function transformApiData(data: BatchGetFromApiType): TorrentCardProp[] {
  const map: Map<string, { seedCount: number; leechCount: number }> = new Map();
  for (let { infoHash, ...s } of data.stat) {
    map.set(infoHash, s);
  }

  return data.torrents.map((t) => {
    return { ...t, ...(map.get(t.infoHash) ?? { seedCount: 0, leechCount: 0 }) };
  });
}
