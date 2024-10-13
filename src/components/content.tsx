import { Component, createMemo, createSignal, onMount } from 'solid-js';
import { TopBar } from './top-bar';
import { IndexSidebar } from './sidebar/index-sidebar';
import { PackSidebar } from './sidebar/pack-sidebar';
import { Nav } from './nav';
import { useParams } from '@solidjs/router';
import signalStore from '../utils/shared-signal';

export const MainContent: Component<any> = (props) => {
  const [total, setTotal] = createSignal(0);
  const params = useParams();

  const [showSearch, setShowSearch] = createSignal(true);

  onMount(() => {
    window.addEventListener('hashchange', (e) => {
      if (/\/pack\//.test(e.newURL)) {
        setShowSearch(false);
      } else {
        setShowSearch(true);
      }
    });
  });

  const renderSidebar = createMemo(() => {
    if (params.id) {
      return <PackSidebar />;
    } else {
      return <IndexSidebar />;
    }
  });
  return (
    <>
      {renderSidebar()}
      <div class="main-content">
        <TopBar showSearch={showSearch()} />
        {props.children}
        <Nav total={signalStore.page.get()} />
      </div>
    </>
  );
};
