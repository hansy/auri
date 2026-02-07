import { Storage } from 'google-cloud/storage';

const storage = new Storage();
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'auri-content';

export const uploadToGCS = async (buffer: Buffer, filename: string, mimeType: string): Promise<string> => {
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(filename);

    await file.save(buffer, {
        contentType: mimeType,
        resumable: false,
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
