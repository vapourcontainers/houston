export default function aliyun<T>(constructor: T): T {
  return (constructor as any)!.default! as T;
}
