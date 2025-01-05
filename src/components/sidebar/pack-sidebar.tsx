import { Component } from 'solid-js';
import Exit from '../../icon/exit.svg';
import OpenFolder from '../../icon/folder-open.svg';
import { SideBarButton } from '../sidebar-button';
import { openInExplorer } from '../../utils/functions/process';
import { NormalImage } from '../../types/global';

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
        <SideBarButton
          icon={OpenFolder}
          onClick={() => {
            const packInfo = JSON.parse(
              sessionStorage.getItem('currentDetailPage') || '{}',
            ) as NormalImage | null;
            if (!packInfo?.path) {
              return;
            }
            openInExplorer(packInfo.path);
          }}
        />
      </div>
    </div>
  );
};
