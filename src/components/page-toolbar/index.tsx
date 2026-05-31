import { Component, createEffect, createSignal } from 'solid-js';
import MultiSelected from '../../icon/multi-select.svg';
import { Icon } from '../icon';
import signalStore from '../../utils/shared-signal';

export const PageToolbar: Component = () => {
  const isManaging = signalStore.isManaging;
  const [unfold, setUnfold] = createSignal(false);

  createEffect(() => {
    setUnfold(isManaging());
    if (!isManaging()) {
      signalStore.selectedPacks.set([]);
    }
  });

  return (
    <div
      class="w-6 fixed left-24 top-20 h-[30px] overflow-hidden transition-all duration-300"
      classList={{
        'h-[60px]': unfold(),
      }}
    >
      <div class="flex flex-col space-y-[10px]">
        <Icon
          icon={MultiSelected}
          size={24}
          class="cursor-pointer"
          classList={{
            'fill-accent-violet': isManaging(),
            'hover:fill-stone-500': !isManaging(),
            'fill-stone-400': !isManaging(),
          }}
          onClick={() => {
            signalStore.isManaging.set((v) => !v);
          }}
        />
      </div>
    </div>
  );
};
