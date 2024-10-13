import { Component } from 'solid-js';
import Exit from '../../icon/exit.svg';
import { SideBarButton } from '../sidebar-button';

export const PackSidebar: Component = () => {
  return (
    <div class="sidebar pack-side">
      <div class="flex flex-col justify-center items-center gap-4">
        <SideBarButton
          icon={Exit}
          onClick={() => {
            window.location.href = sessionStorage.getItem('from') || '/';
          }}
        />
      </div>
    </div>
  );
};
