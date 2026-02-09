import { Storage } from '@google-cloud/storage';
import { parseGCPCredentials } from '../utils/env';

const credentials = parseGCPCredentials(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const storage = new Storage({ credentials });
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'auri-content';

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
