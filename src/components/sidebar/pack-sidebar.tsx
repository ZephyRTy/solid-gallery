import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { openInExplorer } from '../../utils/functions/process';
import signalStore from '../../utils/shared-signal';

export const PackSidebar: Component = () => {
  const navigate = useNavigate();

  const packInfo = () => signalStore.detailPackInfo();

  const handleBack = () => {
    const from = sessionStorage.getItem('from');
    if (from) {
      const hash = new URL(from).hash.replace('#', '') || '/Normal';
      navigate(hash);
    } else {
      navigate('/Normal');
    }
  };

  const handleOpen = () => {
    const info = packInfo();
    if (info?.path) {
      openInExplorer(info.path);
    }
  };

  return (
    <>
      <div class="flex flex-col px-2 pt-2 pb-5 animate-fade-in select-none">
        <span class="font-label-sm text-[10px] text-on-surface-variant/60 uppercase tracking-widest mb-1">
          Detail
        </span>
        <span
          class="text-sm font-semibold text-on-surface leading-tight truncate"
          title={packInfo()?.title}
        >
          {packInfo()?.title || '-'}
        </span>
      </div>

      <div class="flex flex-col gap-1">
        <button
          aria-label="Back to gallery"
          onClick={handleBack}
          class="flex items-center gap-4 px-4 py-3 text-on-surface-variant/70 hover:text-on-surface hover:bg-white/5 transition-all duration-300 rounded-r-full group w-full text-left btn-press"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span class="font-body-md text-sm">Back</span>
        </button>

        <button
          aria-label="Open in explorer"
          onClick={handleOpen}
          class="flex items-center gap-4 px-4 py-3 text-on-surface-variant/70 hover:text-on-surface hover:bg-white/5 transition-all duration-300 rounded-r-full group w-full text-left btn-press"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="shrink-0 transition-transform duration-300 group-hover:rotate-6"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span class="font-body-md text-sm">Open Folder</span>
        </button>
      </div>
    </>
  );
};
