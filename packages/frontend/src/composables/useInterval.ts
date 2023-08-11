import { onBeforeUnmount, onMounted } from 'vue';

export default function useIntreval(handler: () => void, interval: number) {
  let timer: ReturnType<typeof setInterval> | undefined;

  onMounted(() => {
    handler();
    timer = setInterval(handler, interval);
  });

  onBeforeUnmount(() => {
    if (timer) {
      clearInterval(timer);
    }
  });
}
