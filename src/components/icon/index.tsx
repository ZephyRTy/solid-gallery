import { Component, splitProps } from 'solid-js';

interface IProps {
  icon: string;
  size: number;
  class?: string;
  style?: Record<string | symbol, string | number>;
  className?: string;
  classList?: Record<string, boolean>;
  onClick?: [(...args) => void, args: any] | ((...args) => void);
}
export const Icon: Component<IProps> = (properties) => {
  const [props] = splitProps(properties, [
    'icon',
    'size',
    'class',
    'onClick',
    'style',
    'className',
    'classList',
  ]);
  return (
    <div
      class={`[&_svg]:w-full [&_svg]:h-full ${properties.class || ''} ${props.className}`}
      classList={props.classList}
      style={{
        width: `${props.size}px`,
        height: `${props.size}px`,
        ...props.style,
      }}
      onClick={props.onClick}
    >
      {props.icon}
    </div>
  );
};
