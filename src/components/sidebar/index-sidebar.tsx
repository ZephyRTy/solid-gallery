import { Component, createMemo } from 'solid-js';
import { useLocation, useNavigate } from '@solidjs/router';

export const IndexSidebar: Component = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentMode = createMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/ShowDirs')) return 'ShowDirs';
    if (path.startsWith('/Stared')) return 'Stared';
    return 'Normal';
  });

  const modes = [
    {
      id: 'Normal',
      label: 'Collections',
      icon: (
        <path
          d="M4 6h16M4 10h16M4 14h16M4 18h16M4 6h16M4 10h16"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      ),
      svgIcon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="shrink-0"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      id: 'Stared',
      label: 'Starred',
      svgIcon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="shrink-0"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    {
      id: 'ShowDirs',
      label: 'Archives',
      svgIcon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="shrink-0"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div class="mb-14 px-2 flex items-center gap-4">
        <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary border border-primary/30">
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
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <div>
          <h1 class="font-display-lg text-[22px] text-primary tracking-tight leading-none">
            Gallery
          </h1>
          <p class="font-label-sm text-[10px] text-on-surface-variant/60 uppercase tracking-widest mt-1">
            Digital Curator
          </p>
        </div>
      </div>

      <nav class="flex-1 space-y-2">
        {modes.map((m) => {
          const active = currentMode() === m.id;
          return (
            <button
              aria-label={m.label}
              aria-current={active ? 'page' : undefined}
              onClick={() => navigate(`/${m.id}`)}
              class="flex items-center gap-4 px-4 py-3 transition-all duration-300 rounded-r-full group w-full text-left btn-press"
              classList={{
                'sidebar-active': active,
                'text-on-surface-variant/70 hover:text-on-surface hover:bg-white/5':
                  !active,
              }}
            >
              <span
                classList={{
                  'text-primary': active,
                  'text-on-surface-variant/60 group-hover:text-primary transition-colors':
                    !active,
                }}
              >
                {m.svgIcon}
              </span>
              <span class="font-body-md text-sm font-medium">{m.label}</span>
            </button>
          );
        })}
      </nav>

    </>
  );
};
