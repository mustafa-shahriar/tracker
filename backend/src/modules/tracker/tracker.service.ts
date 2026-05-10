import { eq, sql } from "drizzle-orm";
import { db, redis } from "../../db/db.ts";
import { usersTable, userStatTable } from "../../db/schema.ts";

export async function getUserByPassKey(passKey: string) {
    const subQuery = db
        .select({ userId: userStatTable.user_id })
        .from(userStatTable)
        .where(eq(userStatTable.passKey, passKey))
        .limit(1);
    const [result] = await db.select().from(usersTable).where(eq(usersTable.id, subQuery));
    if (!result) {
        throw new Error("unauthorized access");
    }
    return result;
}

interface GetPeersArgs {
    info_hex: string;
    key: string;
    ANNOUNCE_INTERVAL: number;
    numwant: number;
    compact: number;
}
export async function getPeers({
    info_hex,
    ANNOUNCE_INTERVAL,
    numwant,
    key,
    compact,
}: GetPeersArgs) {
    await redis.zRemRangeByScore(info_hex, 0, Date.now() - ANNOUNCE_INTERVAL);
    const peers = await redis.zRangeByScore(info_hex, Date.now() - ANNOUNCE_INTERVAL, "+inf", {
        LIMIT: {
            offset: 0,
            count: numwant,
        },
    });

    await redis.zAdd(info_hex, { score: Date.now(), value: key });

    let payload = undefined;
    let seedersCount = 0;
    let leechersCount = 0;
    if (compact === 1) {
        const buf = Buffer.alloc(peers.length * 6);
        peers.forEach((peer, i) => {
            if (peer.startsWith("s")) {
                seedersCount++;
            } else {
                leechersCount++;
            }
            const [ip, port] = peer.substring(1).split(":");
            const offset = i * 6;
            const parts = ip?.split(".").map(Number);
            parts?.forEach((part, j) => buf.writeUInt8(part, offset + j));
            buf.writeUInt16BE(Number(port), offset + 4);
        });
        payload = buf;
    }
    return { peersList: payload, seedersCount, leechersCount };
}

export interface UpdatePeerSessionArgs {
    user_id: string;
    infohash: string;
    uploaded: number;
    downloaded: number;
    left: number;
}
export async function updatePeerSession({
    user_id,
    infohash,
    uploaded,
    downloaded,
    left,
}: UpdatePeerSessionArgs) {
    const statement = sql`
        INSERT INTO peer_sessions (user_id, infohash, uploaded, downloaded, left, completed_at)
        VALUES (${user_id}, ${infohash}, ${uploaded}, ${downloaded}, ${left}, CASE WHEN $5 = 0 THEN NOW() ELSE NULL END)
        ON CONFLICT (user_id, infohash) DO UPDATE SET
        uploaded = EXCLUDED.uploaded,
        downloaded = EXCLUDED.downloaded,
        left = EXCLUDED.left,
        completed_at = CASE
            WHEN EXCLUDED.left = 0 AND peer_sessions.completed_at IS NULL THEN NOW()
            ELSE peer_sessions.completed_at
        END
        `;
    await db.execute(statement);
}

export async function getSeedLeechCount(ANNOUNCE_INTERVAL: number, infoHex: string) {
    const min = Date.now() - ANNOUNCE_INTERVAL;
    const max = "+inf";
    const script = `
        local key = KEYS[1]
        local minScore = tonumber(ARGV[1])
        local maxScore = ARGV[2]

        local peers = redis.call("ZRANGEBYSCORE", key, minScore, maxScore)

        local seeders = 0
        local leechers = 0

        for i = 1, #peers do
            local p = peers[i]

            if string.sub(p, 1, 1) == "s" then
                seeders = seeders + 1
            else
                leechers = leechers + 1
            end
        end

        return {seeders, leechers}
        `;

    const result = (await redis.eval(script, {
        keys: [infoHex],
        arguments: [String(min), max],
    })) as [number, number];

    return {
        seedCount: result[0],
        leechCount: result[1],
    };
}

export async function getSeedLeechCountsBatch(ANNOUNCE_INTERVAL: number, infoHexList: string[]) {
    const min = Date.now() - ANNOUNCE_INTERVAL;
    const max = "+inf";

    const script = `
        local minScore = tonumber(ARGV[1])
        local maxScore = ARGV[2]

        local result = {}

        for i = 1, #KEYS do
            local key = KEYS[i]
            local peers = redis.call("ZRANGEBYSCORE", key, minScore, maxScore)

            local seeders = 0
            local leechers = 0

            for j = 1, #peers do
                local p = peers[j]

                if string.sub(p, 1, 1) == "s" then
                    seeders = seeders + 1
                else
                    leechers = leechers + 1
                end
            end

            result[i] = {key, seeders, leechers}
        end

        return result
    `;

    const result = (await redis.eval(script, {
        keys: infoHexList,
        arguments: [String(min), max],
    })) as [string, number, number][];

    return result.map(([infoHash, seedCount, leechCount]) => ({
        infoHash,
        seedCount,
        leechCount,
    }));
}
