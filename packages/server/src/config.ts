export interface IConfig {
  accessKeyId: string;
  accessSecret: string;
  regionId: string;
  resourceGroupId: string;
  ecs: {
    securityGroupId: string;
  };
  vpc: {
    vSwitchId: string;
  };
  oss: {
    bucket: string;
  };
};
