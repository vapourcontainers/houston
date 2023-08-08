import { computed, type ComputedRef } from 'vue';
import { getSize } from '@/utils/readable';

export default function useSize(getter: () => number | undefined): ComputedRef<{ value: number, unit: string } | undefined> {
  return computed(() => {
    const size = getter();
    if (size === undefined) {
      return undefined;
    }
    return getSize(size);
  });
}
