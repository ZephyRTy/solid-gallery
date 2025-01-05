import {
  Component,
  createEffect,
  createSignal,
  createUniqueId,
  Show,
  splitProps,
} from 'solid-js';
import { Icon } from '../icon';
import Selected from '../../icon/selected.svg';

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
    <div
      class={`flex justify-center items-center w-6 h-6 ${mainProps.class}`}
      style={props.style}
    >
      <input
        id={id}
        type="checkbox"
        class="invisible w-0 h-0"
        checked={selected()}
        disabled={mainProps.disabled}
        onChange={() => {
          if (mainProps.disabled) return;

          setSelected((v) => !v);
          mainProps.handleChanged?.(selected());
        }}
      ></input>
      <label
        for={id}
        class="w-full h-full rounded-full flex justify-center items-center border-slate-300"
        classList={{
          'bg-sky-400': selected(),
          'border-1': !selected(),
          'bg-slate-100': !selected(),
          'bg-slate-200 cursor-not-allowed': mainProps.disabled,
          'cursor-pointer': !mainProps.disabled,
        }}
      >
        <Show when={selected()}>
          <div>
            <Icon icon={Selected} size={16} class="fill-gray-100" />
          </div>
        </Show>
      </label>
    </div>
  );
};
