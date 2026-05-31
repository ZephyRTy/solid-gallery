import {
  Component,
  createEffect,
  createSignal,
  createUniqueId,
  Match,
  mergeProps,
  onCleanup,
  Switch,
} from 'solid-js';
import { render } from 'solid-js/web';
import SuccessIcon from '../../icon/success.svg';
import ErrorIcon from '../../icon/error.svg';
import { Icon } from '../icon';

enum ToastType {
  Success = 'success',
  Error = 'error',
}

interface IProps {
  message: string;
  duration?: number;
  type?: 'success' | 'error';
  id: string;
}

export const ToastComponent: Component<IProps> = (props) => {
  const [visible, setVisible] = createSignal(true);
  props = mergeProps({ duration: 2000, type: ToastType.Success }, props);

  createEffect(() => {
    if (!visible()) {
      return;
    }
    setTimeout(() => {
      setVisible(false);

      setTimeout(() => {
        const toastElement = document.querySelector(`#${props.id}`);
        toastElement?.remove();
      }, 300);
    }, props.duration);

    onCleanup(() => {});
  });

  return (
    <div
      class="bg-white h-10 w-fit flex justify-center items-center rounded-md my-2.5 px-3 shadow-lg transition-all duration-300"
      id={props.id}
      classList={{
        'opacity-0': !visible(),
      }}
    >
      <div class="flex justify-center items-center">
        <Switch fallback={<Icon icon={SuccessIcon} class="mr-2" size={20} />}>
          <Match when={props.type === ToastType.Success}>
            <Icon icon={SuccessIcon} class="mr-2" size={20} />
          </Match>
          <Match when={props.type === ToastType.Error}>
            <Icon icon={ErrorIcon} class="mr-2" size={20} />
          </Match>
        </Switch>
        <div>{props.message}</div>
      </div>
    </div>
  );
};

export class Toast {
  private constructor() {}

  static show(options: Omit<IProps, 'id'>) {
    let toastElement = document.querySelector('#toast');
    if (!toastElement) {
      toastElement = document.createElement('div');
      toastElement.id = 'toast';
      toastElement.className =
        'fixed top-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center z-[10000]';
      document.body.appendChild(toastElement);
    }

    const id = createUniqueId();

    render(() => <ToastComponent {...options} id={id} />, toastElement);
  }
}
