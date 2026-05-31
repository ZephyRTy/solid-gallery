import {
  Component,
  createEffect,
  createSignal,
  createUniqueId,
  splitProps,
} from 'solid-js';

interface IProps {
  handleChanged?: (e: boolean) => void;
  disabled?: boolean;
  checked?: boolean;
  class?: string;
  style?: Record<string, string | number>;
}

export const Checkbox: Component<IProps> = (props) => {
  const [selected, setSelected] = createSignal(false);
  const id = createUniqueId();
  const [mainProps] = splitProps(props, [
    'handleChanged',
    'disabled',
    'checked',
    'class',
  ]);

  createEffect(() => {
    if (mainProps.checked !== undefined) {
      setSelected(mainProps.checked);
    }
  });

  return (
    <div class={`flex items-center justify-center w-5 h-5 ${mainProps.class}`}>
      <input
        id={id}
        type="checkbox"
        class="sr-only"
        checked={selected()}
        disabled={mainProps.disabled}
        onChange={() => {
          if (mainProps.disabled) return;
          setSelected((v) => !v);
          mainProps.handleChanged?.(selected());
        }}
      />
      <label
        for={id}
        class="w-full h-full rounded border transition-all duration-200 flex items-center justify-center"
        classList={{
          'bg-accent-violet border-accent-violet': selected(),
          'border-stone-300 bg-white': !selected() && !mainProps.disabled,
          'border-stone-200 bg-stone-100 cursor-not-allowed':
            mainProps.disabled,
          'cursor-pointer hover:border-accent-violet':
            !mainProps.disabled && !selected(),
          'animate-pop': selected(),
        }}
      >
        {selected() && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </label>
    </div>
  );
};
