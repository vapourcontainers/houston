export function constructorOf<T>(cls: T): T {
  return (cls as any)!.default! as T;
}
