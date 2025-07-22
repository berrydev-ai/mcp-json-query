import { createWriteStream, promises as fs } from 'fs';
import { dirname, join, basename, resolve } from 'path';
import { Readable } from 'stream';

import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

export interface S3SyncOptions {
  verbose?: boolean;
  preserveDirectoryStructure?: boolean;
}

export interface S3FileInfo {
  exists: boolean;
  lastModified?: Date;
  etag?: string;
  size?: number;
}

export interface S3SyncResult {
  wasDownloaded: boolean;
  localPath: string;
  filename: string;
}

export class S3SyncService {
  private s3Client: S3Client;
  private verbose: boolean;
  private preserveDirectoryStructure: boolean;

  constructor(options: S3SyncOptions = {}) {
    this.verbose = options.verbose || false;
    this.preserveDirectoryStructure = options.preserveDirectoryStructure || false;

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
   * Validate that the root directory exists and is writable
   */
  private async validateRootDirectory(rootPath: string): Promise<void> {
    try {
      // Check if directory exists
      const stats = await fs.stat(rootPath);
      if (!stats.isDirectory()) {
        throw new Error(`Root path is not a directory: ${rootPath}`);
      }

      // Test write permissions by creating a temporary file
      const testFile = join(rootPath, '.mcp-write-test');
      try {
        await fs.writeFile(testFile, 'test');
        await fs.unlink(testFile);
      } catch (error) {
        throw new Error(`Root directory is not writable: ${rootPath}`);
      }

      if (this.verbose) {
        console.error(`✅ Root directory validated: ${rootPath}`);
      }
    } catch (error) {
      const err = error as { code?: string; message: string };
      if (err.code === 'ENOENT') {
        throw new Error(`Root directory does not exist: ${rootPath}`);
      }
      throw error;
    }
  }

  /**
   * Generate local file path based on S3 key and options
   */
  private generateLocalPath(rootPath: string, s3Key: string): string {
    if (this.preserveDirectoryStructure) {
      // Sanitize the S3 key to prevent directory traversal
      const sanitizedKey = s3Key.replace(/\.\./g, '').replace(/^\/+/, '');
      return resolve(join(rootPath, sanitizedKey));
    } else {
      // Just use the filename
      const filename = basename(s3Key);
      if (!filename) {
        throw new Error(`Cannot extract filename from S3 key: ${s3Key}`);
      }
      return join(rootPath, filename);
    }
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

        writeStream.on('error', (error) => {
          // Clean up partial download on error
          fs.unlink(localPath).catch(() => { }); // Ignore cleanup errors
          reject(error);
        });

        readableStream.on('error', (error) => {
          // Clean up partial download on error
          fs.unlink(localPath).catch(() => { }); // Ignore cleanup errors
          reject(error);
        });
      });
    } catch (error) {
      const err = error as { message: string };
      throw new Error(`Failed to download from S3: ${err.message}`);
    }
  }

  /**
   * Sync file from S3 to local path
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
   * Sync file from S3 to MCP root directory
   * Handles path construction, validation, error handling, and logging
   */
  async syncToRoot(s3Uri: string, rootPath: string): Promise<S3SyncResult> {
    try {
      if (this.verbose) {
        console.error(`🌊 Starting S3 sync process for ${s3Uri}`);
      }

      // Validate root directory first
      await this.validateRootDirectory(rootPath);

      // Parse S3 URI to get the key
      const { key } = this.parseS3Uri(s3Uri);

      // Generate local path based on options
      const localPath = this.generateLocalPath(rootPath, key);
      const filename = basename(localPath);

      // Ensure the generated path is within the root directory (security check)
      const resolvedLocalPath = resolve(localPath);
      const resolvedRootPath = resolve(rootPath);

      if (!resolvedLocalPath.startsWith(resolvedRootPath + '/') && resolvedLocalPath !== resolvedRootPath) {
        throw new Error(`Generated path is outside root directory: ${resolvedLocalPath}`);
      }

      const wasDownloaded = await this.syncFile(s3Uri, localPath);

      if (wasDownloaded) {
        console.error(`✅ File synchronized from S3: ${filename}`);
      } else if (this.verbose) {
        console.error(`✅ Local file is already up to date: ${filename}`);
      }

      return { wasDownloaded, localPath, filename };

    } catch (error) {
      const err = error as { message: string };
      const errorMessage = `S3 sync failed: ${err.message}`;

      if (this.verbose) {
        console.error(`❌ ${errorMessage}`);
        console.error('⚠️  S3 sync failed - server will continue without synced file');
      } else {
        console.error(`❌ ${errorMessage}`);
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Check if the provided URI is an S3 URI
   */
  static isS3Uri(uri: string): boolean {
    return uri.startsWith('s3://');
  }
}
