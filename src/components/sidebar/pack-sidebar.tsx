import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { openInExplorer } from '../../utils/functions/process';
import { NormalImage } from '../../types/global';

export const PackSidebar: Component = () => {
  const navigate = useNavigate();

  const packInfo = JSON.parse(
    sessionStorage.getItem('currentDetailPage') || '{}',
  ) as NormalImage | null;

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
    if (packInfo?.path) {
      openInExplorer(packInfo.path);
    }
  };

  return (
    <>
      {/* Brand */}
      <div class="flex flex-col px-1 pt-2 pb-5 animate-fade-in select-none">
        <span class="text-[11px] text-stone-400 tracking-wider uppercase mb-1">
          Detail
        </span>
        <span
          class="text-sm font-semibold text-stone-700 leading-tight truncate"
          title={packInfo?.title}
        >
          {packInfo?.title || '-'}
        </span>
      </div>

      {/* Nav */}
      <div class="flex flex-col gap-1">
        <button
          aria-label="Back to gallery"
          onClick={handleBack}
          class="group relative flex items-center gap-3 w-full h-11 px-3 rounded-xl transition-all duration-300 ease-bounce-sm btn-press shadow-3d text-stone-500 hover:text-stone-700 hover:shadow-3d-hover hover:-translate-y-0.5 hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:ring-offset-1"
        >
          <div class="absolute inset-0 rounded-xl overflow-hidden pointer-events-none bg-gradient-to-b from-white/70 via-white/10 to-transparent" />
          <div class="absolute bottom-px left-2 right-2 h-px rounded-full pointer-events-none bg-white opacity-30 transition-opacity duration-300 group-hover:opacity-60" />
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="relative shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span class="relative text-[13px] font-medium">返回</span>
        </button>

        <button
          aria-label="Open in explorer"
          onClick={handleOpen}
          class="group relative flex items-center gap-3 w-full h-11 px-3 rounded-xl transition-all duration-300 ease-bounce-sm btn-press shadow-3d text-stone-500 hover:text-stone-700 hover:shadow-3d-hover hover:-translate-y-0.5 hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:ring-offset-1"
        >
          <div class="absolute inset-0 rounded-xl overflow-hidden pointer-events-none bg-gradient-to-b from-white/70 via-white/10 to-transparent" />
          <div class="absolute bottom-px left-2 right-2 h-px rounded-full pointer-events-none bg-white opacity-30 transition-opacity duration-300 group-hover:opacity-60" />
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="relative shrink-0 transition-transform duration-300 group-hover:rotate-6"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span class="relative text-[13px] font-medium">打开文件夹</span>
        </button>
      </div>
    </>
  );
};
