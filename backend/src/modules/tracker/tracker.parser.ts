export function normalizeIp(ip: string): string {
    if (ip === "::1") return "127.0.0.1";
    if (ip.startsWith("::ffff:")) return ip.slice(7);

    // block IPv6 for now (important if you don't support it)
    if (ip.includes(":")) {
        return ""; // or skip peer entirely
    }

    return ip;
}

/**
 * Parses the info_hash from an Express request.
 *
 * Returns:
 *   - buffer: the decoded 20-byte SHA-1 Buffer
 *   - hex:    the lowercase hex string (for storage / comparison)
 *
 * Throws a descriptive Error if the hash is missing or the wrong length.
 */
export function parseInfoHash(req: Request): string {
    const rawQuery = extractRawQuery(req.url);
    const rawValue = getRawQueryParam(rawQuery, "info_hash");

    if (!rawValue) {
        throw new Error("Missing info_hash query parameter");
    }

    const buffer = decodeBinaryParam(rawValue);

    if (buffer.length !== 20) {
        throw new Error(`Invalid info_hash: expected 20 bytes, got ${buffer.length}`);
    }

    return buffer.toString("hex");
}

/**
 * Extracts the raw query string from a full URL string (the part after '?').
 */
function extractRawQuery(url: string): string | null {
    const qIdx = url.indexOf("?");
    return qIdx !== -1 ? url.slice(qIdx + 1) : null;
}

/**
 * Extracts a single raw (still percent-encoded) query parameter value from a
 * raw query string, bypassing Express's req.query entirely.
 *
 * req.query is already decoded by the time your handler runs — we must reach
 * back to req.url (or req._parsedUrl.query) to get the untouched bytes.
 */
function getRawQueryParam(rawQuery: string | null | undefined, key: string): string | null {
    if (!rawQuery) return null;

    for (const part of rawQuery.split("&")) {
        const eqIdx = part.indexOf("=");
        if (eqIdx === -1) continue;

        const k = part.slice(0, eqIdx);
        if (k === key) {
            return part.slice(eqIdx + 1); // intentionally NOT decoded
        }
    }

    return null;
}

/**
 * Decodes a percent-encoded string into a Buffer without any UTF-8 interpretation.
 * Each %XX token is converted directly to its numeric byte value.
 *
 * WHY THIS IS NECESSARY:
 * Express (and Node's built-in querystring) decodes percent-encoded query
 * parameters as UTF-8 strings. BitTorrent's info_hash is raw binary — many
 * of its bytes are not valid UTF-8 sequences, so the string gets silently
 * corrupted before your handler ever sees it.
 *
 * This function operates on the still-encoded string extracted directly from
 * req.url, bypassing all framework decoding entirely.
 */
function decodeBinaryParam(encoded: string): Buffer {
    const bytes: number[] = [];
    let i = 0;

    while (i < encoded.length) {
        if (encoded[i] === "%" && i + 2 < encoded.length) {
            const hex = encoded.slice(i + 1, i + 3);
            const byte = parseInt(hex, 16);

            if (!Number.isNaN(byte)) {
                bytes.push(byte);
                i += 3;
                continue;
            }
        }

        if (encoded[i] === "+") {
            // '+' encodes a space in application/x-www-form-urlencoded.
            // BitTorrent clients should not use it, but handle defensively.
            bytes.push(0x20);
        } else {
            bytes.push(encoded.charCodeAt(i));
        }

        i++;
    }

    return Buffer.from(bytes);
}
