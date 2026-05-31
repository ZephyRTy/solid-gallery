import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { openInExplorer } from '../../utils/functions/process';
import { NormalImage } from '../../types/global';

export const PackSidebar: Component = () => {
  const navigate = useNavigate();

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
    const packInfo = JSON.parse(
      sessionStorage.getItem('currentDetailPage') || '{}',
    ) as NormalImage | null;
    if (packInfo?.path) {
      openInExplorer(packInfo.path);
    }
  };

  return (
    <>
      <button
        aria-label="Back to gallery"
        onClick={handleBack}
        title="Back"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-stone-300 hover:text-stone-700 hover:bg-stone-50 transition-all duration-200 btn-press focus-visible:ring-2 focus-visible:ring-accent-violet"
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
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        aria-label="Open in explorer"
        onClick={handleOpen}
        title="Open folder"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-stone-300 hover:text-stone-700 hover:bg-stone-50 transition-all duration-200 btn-press focus-visible:ring-2 focus-visible:ring-accent-violet"
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
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </>
  );
};
