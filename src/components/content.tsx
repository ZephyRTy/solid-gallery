import { Component, createEffect, createMemo, createSignal } from 'solid-js';
import { TopBar } from './top-bar';
import { IndexSidebar } from './sidebar/index-sidebar';
import { PackSidebar } from './sidebar/pack-sidebar';
import { Nav } from './nav';
import { SelectionBar } from './selection-bar';
import { FolderDrawer } from './drawer/folder-drawer';
import { useLocation, useParams } from '@solidjs/router';
import signalStore from '../utils/shared-signal';
import { cn } from '@/utils/functions/cn';

export const MainContent: Component<any> = (props) => {
  const params = useParams();
  const isPackPage = createMemo(() => !!params.id);
  const location = useLocation();
  const isFolderPage = createMemo(() => location.pathname.includes('/ShowDirs'));
  const [headerScrolled, setHeaderScrolled] = createSignal(false);
  let scrollContainer: HTMLDivElement | undefined;

  const handleScroll = () => {
    if (scrollContainer) {
      setHeaderScrolled(scrollContainer.scrollTop > 10);
    }
  };

  return (
    <div class="flex h-full w-full">
      <aside
        class="fixed left-0 top-0 bottom-0 w-[280px] flex flex-col py-10 px-6 glass-sidebar z-50"
        aria-label="Main navigation"
      >
        {isPackPage() ? <PackSidebar /> : <IndexSidebar />}
      </aside>

      <main class="ml-[280px] flex-1 flex flex-col h-screen relative overflow-hidden">
        <TopBar isPackPage={isPackPage()} headerScrolled={headerScrolled()} />

        <div
          ref={scrollContainer}
          onScroll={handleScroll}
          class={cn(
            'mt-20 flex-1 overflow-y-auto scroll-hide p-10 pb-28',
            isFolderPage() && 'p-0',
          )}
        >
          <SelectionBar />
          <div class="min-h-0">{props.children}</div>
        </div>

        <Nav total={signalStore.page()} />
      </main>
      <FolderDrawer />
    </div>
  );
};
