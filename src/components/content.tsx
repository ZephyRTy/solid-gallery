import { Component, createMemo } from 'solid-js';
import { TopBar } from './top-bar';
import { IndexSidebar } from './sidebar/index-sidebar';
import { PackSidebar } from './sidebar/pack-sidebar';
import { Nav } from './nav';
import { SelectionBar } from './selection-bar';
import { FolderDrawer } from './drawer/folder-drawer';
import { useParams } from '@solidjs/router';
import signalStore from '../utils/shared-signal';

export const MainContent: Component<any> = (props) => {
  const params = useParams();
  const isPackPage = createMemo(() => !!params.id);

  return (
    <div class="flex h-full w-full">
      <nav
        class="flex flex-col items-center py-8 gap-6 z-10 w-12 shrink-0"
        aria-label="Page navigation"
      >
        {isPackPage() ? <PackSidebar /> : <IndexSidebar />}
      </nav>
      <main class="flex-1 flex flex-col min-w-0 bg-stone-50">
        <TopBar isPackPage={isPackPage()} />
        <div class="flex-1 overflow-auto">{props.children}</div>
        <Nav total={signalStore.page()} />
      </main>
      <SelectionBar />
      <FolderDrawer />
    </div>
  );
};
