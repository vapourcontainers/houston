export interface BucketStat {
  storage?: number;
  objectCount?: number;
  multipartUploadCount?: number;
  liveChannelCount?: number;
  lastModifiedTime?: number;
  standardStorage?: number;
  standardObjectCount?: number;
  infrequentAccessStorage?: number;
  infrequentAccessRealStorage?: number;
  infrequentAccessObjectCount?: number;
  archiveStorage?: number;
  archiveRealStorage?: number;
  archiveObjectCount?: number;
  coldArchiveStorage?: number;
  coldArchiveRealStorage?: number;
  coldArchiveObjectCount?: number;
}
