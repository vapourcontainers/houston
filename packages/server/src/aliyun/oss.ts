import { OpenApiRequest, Params } from '@alicloud/openapi-client';
import type Client from '@alicloud/oss20190517';
import { RuntimeOptions } from '@alicloud/tea-util';
import { Model, cast } from '@alicloud/tea-typescript';

export class GetBucketStatResponse extends Model {
  headers: Record<string, string> = {};
  statusCode: number = 0;
  body: BucketStat = new BucketStat();

  static names(): Record<string, any> {
    return {
      headers: 'headers',
      statusCode: 'statusCode',
      body: 'body',
    };
  }

  static types(): Record<string, any> {
    return {
      headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
      statusCode: 'number',
      body: BucketStat,
    };
  }

  constructor(map?: Record<string, any>) {
    super(map);
  }
}

export class BucketStat extends Model {
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

  static names(): Record<string, string> {
    return {
      storage: 'Storage',
      objectCount: 'ObjectCount',
      multipartUploadCount: 'MultipartUploadCount',
      liveChannelCount: 'LiveChannelCount',
      lastModifiedTime: 'LastModifiedTime',
      standardStorage: 'StandardStorage',
      standardObjectCount: 'StandardObjectCount',
      infrequentAccessStorage: 'InfrequentAccessStorage',
      infrequentAccessRealStorage: 'InfrequentAccessRealStorage',
      infrequentAccessObjectCount: 'InfrequentAccessObjectCount',
      archiveStorage: 'ArchiveStorage',
      archiveRealStorage: 'ArchiveRealStorage',
      archiveObjectCount: 'ArchiveObjectCount',
      coldArchiveStorage: 'ColdArchiveStorage',
      coldArchiveRealStorage: 'ColdArchiveRealStorage',
      coldArchiveObjectCount: 'ColdArchiveObjectCount',
    };
  }

  static types(): Record<string, any> {
    return {
      storage: 'number',
      objectCount: 'number',
      multipartUploadCount: 'number',
      liveChannelCount: 'number',
      lastModifiedTime: 'number',
      standardStorage: 'number',
      standardObjectCount: 'number',
      infrequentAccessStorage: 'number',
      infrequentAccessRealStorage: 'number',
      infrequentAccessObjectCount: 'number',
      archiveStorage: 'number',
      archiveRealStorage: 'number',
      archiveObjectCount: 'number',
      coldArchiveStorage: 'number',
      coldArchiveRealStorage: 'number',
      coldArchiveObjectCount: 'number',
    };
  }

  constructor(map?: Record<string, any>) {
    super(map);
  }
}

export async function getBucketStat(client: Client, bucket: string) {
  const apiReq = new OpenApiRequest({
    hostMap: {
      bucket: bucket,
    },
    headers: {},
  });

  const apiParams = new Params({
    action: "GetBucketStat",
    version: "2019-05-17",
    protocol: "HTTPS",
    pathname: `/?stat`,
    method: "GET",
    authType: "AK",
    style: "ROA",
    reqBodyType: "xml",
    bodyType: "xml",
  });

  const apiRuntime = new RuntimeOptions({
  });

  return cast<GetBucketStatResponse>(await client.execute(apiParams, apiReq, apiRuntime), new GetBucketStatResponse({}));
}
