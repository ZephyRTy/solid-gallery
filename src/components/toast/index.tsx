import {
  Component,
  createEffect,
  createSignal,
  createUniqueId,
  mergeProps,
} from 'solid-js';
import { render } from 'solid-js/web';

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
  props = mergeProps({ duration: 3000, type: ToastType.Success }, props);

  createEffect(() => {
    if (!visible()) return;
    const timer = setTimeout(() => setVisible(false), props.duration);
    return () => clearTimeout(timer);
  });

  const isSuccess = () => props.type === ToastType.Success;

  return (
    <div
      id={props.id}
      role="alert"
      aria-live="polite"
      class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 animate-slide-up"
      classList={{
        'bg-white text-stone-800': isSuccess(),
        'bg-accent-rose text-white': !isSuccess(),
        'opacity-0 translate-y-2': !visible(),
      }}
    >
      {isSuccess() ? (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#10b981"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      )}
      <span class="text-sm font-medium">{props.message}</span>
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
        'fixed top-6 right-6 z-toast flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(toastElement);
    }
    const id = createUniqueId();
    render(() => <ToastComponent {...options} id={id} />, toastElement);
  }
}
