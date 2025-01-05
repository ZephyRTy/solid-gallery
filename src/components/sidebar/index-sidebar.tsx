import { Component, Show, createSignal, onMount } from 'solid-js';
import Star from '../../icon/star.svg';
import Home from '../../icon/home.svg';
import Folder from '../../icon/folder.svg';

import { useParams } from '@solidjs/router';
import { Mode } from '../../types/global';
import { ActiveInfo, RouteButton } from '../sidebar-button';

export const IndexSidebar: Component = () => {
  const params = useParams();
  const [active, setActive] = createSignal({
    active: location.href.includes('#/ShowDirs')
      ? Mode.Folder
      : params.mode || Mode.Normal,
    position: 0,
    el: null,
  } as ActiveInfo);

  onMount(() => {
    window.addEventListener('resize', () => {
      if (active().el) {
        setActive({
          active: active().active,
          position: active().el?.getBoundingClientRect().top || 0,
          el: active().el,
        });
      }
    });
  });
  return (
    <div class="sidebar">
      <div class="flex flex-col justify-center items-center gap-4 relative">
        <Show when={active().position}>
          <div
            class="active-page-bg"
            style={{
              top: active().position + 'px',
            }}
          ></div>
        </Show>
        <RouteButton
          icon={Home}
          id={Mode.Normal}
          setActive={setActive}
          active={active().active}
        />
        <RouteButton
          icon={Star}
          id={Mode.Star}
          setActive={setActive}
          active={active().active}
        />
        <RouteButton
          icon={Folder}
          id={Mode.Folder}
          setActive={setActive}
          active={active().active}
        />
      </div>
    </div>
  );
};
