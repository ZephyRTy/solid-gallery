import { Component, createEffect, createSignal, splitProps } from 'solid-js';
import './index.less';
import MultiSelected from '../../icon/multi-select.svg';
import AddToFolder from '../../icon/add-to-folder.svg';
import { Icon } from '../icon';
import signalStore from '../../utils/shared-signal';
import { IFolderItemProps } from '../folder-list';

interface IProps {
  selectedDir?: IFolderItemProps;
}
export const PageToolbar: Component<IProps> = (properties) => {
  const isManaging = signalStore.isManaging;
  const [unfold, setUnfold] = createSignal(false);
  const [prop] = splitProps(properties, ['selectedDir']);

  createEffect(() => {
    setUnfold(isManaging());
    if (!isManaging()) {
      signalStore.selectedPacks.set([]);
    }
  });
  return (
    <div
      class="w-6 fixed left-24 top-20 page-toolbar-wrapper "
      classList={{
        'page-toolbar-unfold': unfold(),
      }}
    >
      <div class="page-toolbar flex flex-col">
        <Icon
          icon={MultiSelected}
          size={24}
          class="cursor-pointer"
          classList={{
            'fill-sky-400': isManaging(),
            'hover:fill-slate-500': !isManaging(),
            'fill-slate-400': !isManaging(),
          }}
          onClick={() => {
            signalStore.isManaging.set((v) => !v);
            // signalStore.selectedPacks.set([]);
          }}
        />
        <Icon
          icon={AddToFolder}
          size={24}
          class={`cursor-pointer  ${signalStore.selectedPacks().length ? 'fill-sky-400' : 'fill-slate-400'}`}
          onClick={() => {
            if (!signalStore.selectedPacks().length) {
              return;
            }
            signalStore.folderDialogVisible.set(true);
            // galleryOperator
            //   .addFileToDir(prop.selectedDir!.id, signalStore.selectedPacks())
            //   .then(() => {
            //     signalStore.folderDialogVisible.set(false);
            //     signalStore.selectedPacks.set([]);
            //     signalStore.refresh.set((v) => !v);
            //   });
          }}
        />
      </div>
    </div>
  );
};
