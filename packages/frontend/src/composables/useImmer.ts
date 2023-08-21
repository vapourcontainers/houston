import { shallowRef, type ShallowRef } from 'vue';
import { produce } from 'immer';

export function useImmer<T>(baseState: T): [ShallowRef<T>, IImmer<T>] {
  const state = shallowRef(baseState);
  const update = (updater: IUpdater<T>) => {
    state.value = produce(state.value, updater);
  };
  return [state, update];
}

type IUpdater<T> = (draft: T) => void;
type IImmer<T> = (updater: IUpdater<T>) => void;
