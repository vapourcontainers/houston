import { Inject, Injectable } from '@nestjs/common';

import { Config, OpenApiRequest, Params } from '@alicloud/openapi-client';
import { Model, cast } from '@alicloud/tea-typescript';
import { RuntimeOptions } from '@alicloud/tea-util';
import OSS from '@alicloud/oss20190517';

import { constructorOf } from './sdk';
import { CONFIG, type IConfig } from './config.service';

@Injectable()
export class OSSService extends constructorOf(OSS) {
  constructor(@Inject(CONFIG) config: IConfig) {
    super(new Config({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessSecret,
      regionId: config.regionId,
      endpoint: `oss-${config.regionId}.aliyuncs.com`,
    }));
  }

  async getBucketStat(bucket: string): Promise<GetBucketStatResponse> {
    const req = new OpenApiRequest({
      hostMap: {
        bucket: bucket,
      },
      headers: {},
    });

    const params = new Params({
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

    const options = new RuntimeOptions({
    });

    return cast(await this.execute(params, req, options), new GetBucketStatResponse({}));
  }
}

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
