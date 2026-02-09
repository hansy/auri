import { Readable } from "stream";

/**
 * Converts a Web ReadableStream or Node.js Readable stream to a Buffer.
 */
export const streamToBuffer = async (stream: Readable | ReadableStream<Uint8Array>): Promise<Buffer> => {
    // Handle Node.js Readable stream
    if (stream instanceof Readable) {
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        return Buffer.concat(chunks);
    }

    // Handle Web ReadableStream
    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
    }

    return Buffer.from(combined);
};
