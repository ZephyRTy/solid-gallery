import { Component, mergeProps, onMount, Setter } from 'solid-js';
import { Icon } from '../icon';

interface IBtnProps {
  icon: string;
  size?: number;
  style?: Record<string | symbol, number | string>;
  className?: string;
  onClick?: (...args) => void;
}

export const SideBarButton: Component<IBtnProps> = (p) => {
  const props = mergeProps({ size: 24 }, p);
  let btnRef = null as unknown as HTMLButtonElement;

  const handleClick = (...args) => {
    if (props.onClick) {
      props.onClick(...args);
    }
  };

  return (
    <button
      class={`fill-white w-12 h-12 flex-center cursor-pointer z-50 side-btn transition-all duration-300 side-btn ${
        props.className
      }`}
      style={props.style}
      onClick={handleClick}
      ref={btnRef}
    >
      <Icon icon={props.icon} size={props.size} class="w-8/10" />
    </button>
  );
};

interface IRouteBtnProps {
  icon: string;
  id?: string;
  style?: Record<string | symbol, number | string>;
  className?: string;
  defaultActive?: boolean;
  setActive?: Setter<ActiveInfo>;
  active?: string;
  size?: number;
  handleClick?: (...args) => void;
}

export interface ActiveInfo {
  active: string;
  position: number;
  el: HTMLButtonElement | null;
}

export const RouteButton: Component<IRouteBtnProps> = (p) => {
  const props = mergeProps({ size: 24 }, p);
  let btnRef = null as unknown as HTMLButtonElement;
  const handleClick = (...args) => {
    if (props.id) {
      props.setActive?.({
        active: props.id,
        position: btnRef.getBoundingClientRect().top,
        el: btnRef,
      });
      location.href = `#/${props.id}`;
    }
    if (props.handleClick) {
      props.handleClick(...args);
    }
  };

  onMount(() => {
    if (props.id !== undefined && props.active === props.id) {
      props.setActive?.({
        el: btnRef,
        active: props.id,
        position: btnRef.getBoundingClientRect().top,
      });
    }
  });

  return (
    <button
      class={
        'w-12 h-12 flex-center cursor-pointer z-50 side-btn transition-all duration-300 side-btn' +
        (props.active === props.id
          ? ' fill-sky-400 btn-active '
          : ' fill-white')
      }
      classList={{
        [props.className || '']: !!props.className,
      }}
      style={props.style}
      onClick={handleClick}
      ref={btnRef}
    >
      <Icon icon={props.icon} size={props.size} class="w-8/10" />
    </button>
  );
};
