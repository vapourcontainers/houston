export type IExtractor<T> = { regex: RegExp, transform: (match: RegExpMatchArray) => T };

export type IExtractors<K> = {
  [P in keyof K]: IExtractor<K[P]>;
};

export type IExtractResult<Fields> = {
  [K in keyof Fields]:
  Fields[K] extends IExtractor<infer T> ? T : never;
};

export default function extractFields<Fields>(text: string, extractors: IExtractors<Fields>): IExtractResult<Fields> | undefined {
  const result: Record<string, unknown> = {};

  for (const key in extractors) {
    const extractor = extractors[key];

    const match = text.match(extractor.regex);
    if (!match) return;

    result[key] = extractor.transform(match);
  }

  return result as IExtractResult<Fields>;
}
