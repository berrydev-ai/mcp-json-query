import { createWriteStream, promises as fs } from 'fs';
import { dirname } from 'path';
import { Readable } from 'stream';

import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

export interface S3SyncOptions {
  verbose?: boolean;
}

export interface S3FileInfo {
  exists: boolean;
  lastModified?: Date;
  etag?: string;
  size?: number;
}

export class S3SyncService {
  private s3Client: S3Client;
  private verbose: boolean;

  constructor(options: S3SyncOptions = {}) {
    this.verbose = options.verbose || false;

    // Initialize S3 client with credentials from environment or config
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined, // Let SDK handle credentials (IAM roles, profiles, etc.)
    });
  }

  /**
   * Parse S3 URI into bucket and key components
   */
  private parseS3Uri(s3Uri: string): { bucket: string; key: string } {
    if (!s3Uri.startsWith('s3://')) {
      throw new Error(`Invalid S3 URI format: ${s3Uri}. Must start with 's3://'`);
    }

    const withoutProtocol = s3Uri.slice(5); // Remove 's3://'
    const slashIndex = withoutProtocol.indexOf('/');

    if (slashIndex === -1) {
      throw new Error(`Invalid S3 URI format: ${s3Uri}. Must include bucket and key`);
    }

    const bucket = withoutProtocol.slice(0, slashIndex);
    const key = withoutProtocol.slice(slashIndex + 1);

    if (!bucket || !key) {
      throw new Error(`Invalid S3 URI format: ${s3Uri}. Both bucket and key are required`);
    }

    return { bucket, key };
  }

  /**
   * Get information about a file in S3
   */
  private async getS3FileInfo(bucket: string, key: string): Promise<S3FileInfo> {
    try {
      const command = new HeadObjectCommand({ Bucket: bucket, Key: key });
      const response = await this.s3Client.send(command);

      return {
        exists: true,
        lastModified: response.LastModified,
        etag: response.ETag,
        size: response.ContentLength,
      };
    } catch (error: unknown) {
      const err = error as { name?: string; $metadata?: { httpStatusCode?: number } };
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return { exists: false };
      }
      throw error;
    }
  }

  /**
   * Get information about a local file
   */
  private async getLocalFileInfo(filePath: string): Promise<S3FileInfo> {
    try {
      const stats = await fs.stat(filePath);
      return {
        exists: true,
        lastModified: stats.mtime,
        size: stats.size,
      };
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === 'ENOENT') {
        return { exists: false };
      }
      throw error;
    }
  }

  /**
   * Determine if S3 file is newer than local file
   */
  private isS3FileNewer(s3Info: S3FileInfo, localInfo: S3FileInfo): boolean {
    if (!localInfo.exists) {
      return true; // Local file doesn't exist, so S3 is "newer"
    }

    if (!s3Info.exists || !s3Info.lastModified || !localInfo.lastModified) {
      return false; // Can't compare, assume local is current
    }

    return s3Info.lastModified > localInfo.lastModified;
  }

  /**
   * Download file from S3 with progress reporting
   */
  private async downloadFromS3(bucket: string, key: string, localPath: string): Promise<void> {
    try {
      // Ensure local directory exists
      const dir = dirname(localPath);
      await fs.mkdir(dir, { recursive: true });

      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('No body in S3 response');
      }

      const writeStream = createWriteStream(localPath);
      const readableStream = response.Body as Readable;

      return new Promise((resolve, reject) => {
        let downloadedBytes = 0;
        const totalBytes = response.ContentLength || 0;

        readableStream.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          if (this.verbose && totalBytes > 0) {
            const progress = Math.round((downloadedBytes / totalBytes) * 100);
            console.error(`Downloading: ${progress}% (${downloadedBytes}/${totalBytes} bytes)`);
          }
        });

        readableStream.pipe(writeStream);

        writeStream.on('finish', () => {
          if (this.verbose) {
            console.error(`✅ Successfully downloaded ${key} to ${localPath}`);
          }
          resolve();
        });

        writeStream.on('error', reject);
        readableStream.on('error', reject);
      });
    } catch (error) {
      const err = error as { message: string };
      throw new Error(`Failed to download from S3: ${err.message}`);
    }
  }

  /**
   * Sync file from S3 to local workspace
   * Returns true if file was downloaded, false if no sync was needed
   */
  async syncFile(s3Uri: string, localPath: string): Promise<boolean> {
    try {
      const { bucket, key } = this.parseS3Uri(s3Uri);

      if (this.verbose) {
        console.error(`🔍 Checking sync status for ${s3Uri} -> ${localPath}`);
      }

      // Get file information from both sources
      const [s3Info, localInfo] = await Promise.all([
        this.getS3FileInfo(bucket, key),
        this.getLocalFileInfo(localPath),
      ]);

      if (!s3Info.exists) {
        throw new Error(`S3 file does not exist: ${s3Uri}`);
      }

      // Check if sync is needed
      const needsSync = this.isS3FileNewer(s3Info, localInfo);

      if (!needsSync) {
        if (this.verbose) {
          console.error(`✅ Local file is up to date: ${localPath}`);
        }
        return false;
      }

      // Perform sync
      if (this.verbose) {
        if (localInfo.exists) {
          console.error(`📥 S3 file is newer, syncing: ${s3Uri} -> ${localPath}`);
        } else {
          console.error(`📥 Local file does not exist, downloading: ${s3Uri} -> ${localPath}`);
        }
      }

      await this.downloadFromS3(bucket, key, localPath);
      return true;
    } catch (error) {
      const err = error as { message: string };
      throw new Error(`S3 sync failed: ${err.message}`);
    }
  }

  /**
   * Check if the provided URI is an S3 URI
   */
  static isS3Uri(uri: string): boolean {
    return uri.startsWith('s3://');
  }
}
