import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream';
import { parseGCPCredentials } from '../utils/env';

const credentials = parseGCPCredentials(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const storage = new Storage({ credentials });
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'auri-content';

/**
 * Pipes a Web ReadableStream directly to GCS without buffering.
 * Uses Readable.fromWeb() to convert Web stream to Node stream.
 */
export const streamToGCS = async (
    stream: ReadableStream<Uint8Array>,
    filename: string,
    mimeType: string
): Promise<string> => {
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(filename);

    // Convert Web ReadableStream to Node.js Readable
    const nodeStream = Readable.fromWeb(stream as Parameters<typeof Readable.fromWeb>[0]);

    const writeStream = file.createWriteStream({
        contentType: mimeType,
        resumable: false,
    });

    return new Promise((resolve, reject) => {
        nodeStream.on('error', (err) => {
            writeStream.destroy(err);
            reject(err);
        });

        writeStream.on('error', reject);
        writeStream.on('finish', () => resolve(`gs://${BUCKET_NAME}/${filename}`));

        nodeStream.pipe(writeStream);
    });
};

export const uploadToGCS = async (buffer: Buffer, filename: string, mimeType: string): Promise<string> => {
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(filename);

    await file.save(buffer, {
        contentType: mimeType,
        resumable: false,
        validation: false, // Disable validation to prevent Bun stream crashes
    });

    return `gs://${BUCKET_NAME}/${filename}`;
};

export const getSignedUrl = async (filename: string): Promise<string> => {
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(filename);

    const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    return url;
};
