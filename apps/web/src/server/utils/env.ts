/**
 * Parses a GCP service account JSON from an environment variable.
 * Handles double-escaped newlines in the private_key that occur when
 * storing JSON in env vars.
 */
export const parseGCPCredentials = (envValue: string | undefined): object => {
    const json = JSON.parse(envValue || '{}');

    if (json.private_key) {
        json.private_key = json.private_key.replace(/\\n/g, '\n');
    }

    return json;
};
