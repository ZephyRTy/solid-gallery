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
      label: 'Home',
      icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    },
    {
      id: 'Stared',
      label: 'Starred',
      icon: (
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      ),
    },
    {
      id: 'ShowDirs',
      label: 'Folders',
      icon: (
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      ),
    },
  ];

  return (
    <>
      {modes.map((m) => {
        const active = currentMode() === m.id;
        return (
          <button
            aria-label={m.label}
            aria-current={active ? 'page' : undefined}
            onClick={() => navigate(`/${m.id}`)}
            class="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 btn-press focus-visible:ring-2 focus-visible:ring-accent-violet"
            classList={{
              'text-accent-violet bg-violet-50 scale-110': active,
              'text-stone-300 hover:text-stone-600 hover:bg-stone-50': !active,
            }}
            title={m.label}
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
              {m.icon}
            </svg>
          </button>
        );
      })}
    </>
  );
};
