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
      label: '首页',
      icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    },
    {
      id: 'Stared',
      label: '星标',
      icon: (
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      ),
    },
    {
      id: 'ShowDirs',
      label: '文件夹',
      icon: (
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      ),
    },
  ];

  return (
    <>
      {/* Brand */}
      <div class="flex items-center gap-2.5 px-1 pt-2 pb-5 animate-fade-in select-none">
        <div class="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center shadow-3d">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <span class="text-sm font-semibold text-stone-700 tracking-tight">
          Gallery
        </span>
      </div>

      {/* Nav */}
      <div class="flex flex-col gap-1">
        {modes.map((m) => {
          const active = currentMode() === m.id;
          return (
            <button
              aria-label={m.label}
              aria-current={active ? 'page' : undefined}
              onClick={() => navigate(`/${m.id}`)}
              class="group relative flex items-center gap-3 w-full h-11 px-3 rounded-xl transition-all duration-300 ease-bounce-sm btn-press focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:ring-offset-1"
              classList={{
                'shadow-3d-active translate-y-px bg-violet-500 text-white':
                  active,
                'shadow-3d text-stone-500 hover:text-stone-700 hover:shadow-3d-hover hover:-translate-y-0.5 hover:bg-stone-50':
                  !active,
              }}
            >
              {/* Surface highlight */}
              <div
                class="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
                classList={{
                  'bg-gradient-to-b from-white/20 via-white/5 to-transparent':
                    active,
                  'bg-gradient-to-b from-white/70 via-white/10 to-transparent':
                    !active,
                }}
              />
              {/* Bottom rim light */}
              <div
                class="absolute bottom-px left-2 right-2 h-px rounded-full pointer-events-none opacity-0 transition-opacity duration-300"
                classList={{
                  'opacity-30 bg-white': !active,
                  'group-hover:opacity-60': !active,
                }}
              />
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="relative shrink-0 transition-transform duration-300"
                classList={{
                  'group-hover:rotate-6': !active,
                }}
              >
                {m.icon}
              </svg>
              <span class="relative text-[13px] font-medium">{m.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
