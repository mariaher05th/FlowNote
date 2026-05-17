import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId = 'lavanda' | 'ocean' | 'dark';

export interface ThemePalette {
  id: ThemeId;
  name: string;
  preview: [string, string, string];
  vars: Record<string, string>;
}

export const THEMES: ThemePalette[] = [
  {
    id: 'lavanda',
    name: 'Lavanda',
    preview: ['#EAE4F8', '#8070C8', '#2F2840'],
    vars: {
      '--app-bg':                    '#F6F4FB',
      '--app-fg':                    '#2F2840',
      '--sidebar-bg':                '#EAE4F8',
      '--sidebar-border':            '#D8D0EC',
      '--sidebar-title':             '#8070C8',
      '--sidebar-active-bg':         '#E0D8F8',
      '--sidebar-active-fg':         '#8070C8',
      '--sidebar-inactive-fg':       '#9080B0',
      '--sidebar-user-role':         '#C070A0',
      '--sidebar-avatar-bg':         '#E0D8F8',
      '--sidebar-avatar-border':     '#8070C8',
      '--sidebar-avatar-fg':         '#8070C8',
      '--header-bg':                 '#FFFFFF',
      '--header-border':             '#E4DCF4',
      '--header-fg':                 '#2F2840',
      '--card-bg':                   '#FFFFFF',
      '--card-border':               '#E4DCF4',
      '--card-title':                '#2F2840',
      '--primary':                   '#8070C8',
      '--primary-fg':                '#FFFFFF',
      '--muted-fg':                  '#B0A0C0',
      '--subtle-fg':                 '#9080B0',
      '--dim-fg':                    '#5A5070',
      '--input-bg':                  '#FFFFFF',
      '--input-border':              '#D8D0EC',
      '--tag-bg':                    '#F0EAF8',
      '--tag-fg':                    '#8070C8',
      '--highlight-bg':              '#EDE8F8',
      '--highlight-border':          '#D8D0EC',
      '--progress-track':            '#EDE8F8',
      '--banner-bg':                 '#EDE8F8',
      '--banner-border':             '#D8D0EC',
      '--banner-fg':                 '#7060A8',
      '--banner-sub':                '#9080B0',
      '--status-pending-bg':         '#F8D8EC',
      '--status-pending-fg':         '#A06080',
      '--status-inprogress-bg':      '#E0D8F8',
      '--status-inprogress-fg':      '#7060A8',
      '--status-done-bg':            '#D8F8EC',
      '--status-done-fg':            '#408060',
      '--whiteboard-bg':             '#F6F4FB',
      '--whiteboard-toolbar-bg':     '#FFFFFF',
      '--whiteboard-toolbar-border': '#E4DCF4',
      '--whiteboard-dot':            '#D8D0EC',
      '--whiteboard-tool-active-bg': '#E0D8F8',
      '--whiteboard-tool-active-fg': '#8070C8',
      '--whiteboard-tool-fg':        '#9080B0',
      '--hero-gradient':             'linear-gradient(135deg, #E0D8F8 0%, #F8D8EC 50%, #D8ECF8 100%)',
      '--team-bar-bg':               '#EDE8F8',
      '--team-bar-border':           '#D8D0EC',
    },
  },
  {
    id: 'ocean',
    name: 'Océano',
    preview: ['#DBEAFE', '#2563EB', '#1E3A5F'],
    vars: {
      '--app-bg':                    '#EFF6FF',
      '--app-fg':                    '#1E3A5F',
      '--sidebar-bg':                '#DBEAFE',
      '--sidebar-border':            '#BFDBFE',
      '--sidebar-title':             '#2563EB',
      '--sidebar-active-bg':         '#BFDBFE',
      '--sidebar-active-fg':         '#1D4ED8',
      '--sidebar-inactive-fg':       '#4A7A9B',
      '--sidebar-user-role':         '#0EA5E9',
      '--sidebar-avatar-bg':         '#BFDBFE',
      '--sidebar-avatar-border':     '#2563EB',
      '--sidebar-avatar-fg':         '#1D4ED8',
      '--header-bg':                 '#FFFFFF',
      '--header-border':             '#BFDBFE',
      '--header-fg':                 '#1E3A5F',
      '--card-bg':                   '#FFFFFF',
      '--card-border':               '#BFDBFE',
      '--card-title':                '#1E3A5F',
      '--primary':                   '#2563EB',
      '--primary-fg':                '#FFFFFF',
      '--muted-fg':                  '#4A7A9B',
      '--subtle-fg':                 '#3B6EA5',
      '--dim-fg':                    '#1E4D7B',
      '--input-bg':                  '#FFFFFF',
      '--input-border':              '#93C5FD',
      '--tag-bg':                    '#DBEAFE',
      '--tag-fg':                    '#1D4ED8',
      '--highlight-bg':              '#EFF6FF',
      '--highlight-border':          '#BFDBFE',
      '--progress-track':            '#DBEAFE',
      '--banner-bg':                 '#DBEAFE',
      '--banner-border':             '#93C5FD',
      '--banner-fg':                 '#1D4ED8',
      '--banner-sub':                '#3B82F6',
      '--status-pending-bg':         '#FEE2E2',
      '--status-pending-fg':         '#B91C1C',
      '--status-inprogress-bg':      '#DBEAFE',
      '--status-inprogress-fg':      '#1D4ED8',
      '--status-done-bg':            '#D1FAE5',
      '--status-done-fg':            '#065F46',
      '--whiteboard-bg':             '#EFF6FF',
      '--whiteboard-toolbar-bg':     '#FFFFFF',
      '--whiteboard-toolbar-border': '#BFDBFE',
      '--whiteboard-dot':            '#93C5FD',
      '--whiteboard-tool-active-bg': '#BFDBFE',
      '--whiteboard-tool-active-fg': '#1D4ED8',
      '--whiteboard-tool-fg':        '#4A7A9B',
      '--hero-gradient':             'linear-gradient(135deg, #BFDBFE 0%, #E0F2FE 50%, #DBEAFE 100%)',
      '--team-bar-bg':               '#DBEAFE',
      '--team-bar-border':           '#93C5FD',
    },
  },
  {
    id: 'dark',
    name: 'Oscuro',
    preview: ['#27272A', '#A78BFA', '#E4E4E7'],
    vars: {
      '--app-bg':                    '#18181B',
      '--app-fg':                    '#E4E4E7',
      '--sidebar-bg':                '#27272A',
      '--sidebar-border':            '#3F3F46',
      '--sidebar-title':             '#A78BFA',
      '--sidebar-active-bg':         '#3F3F46',
      '--sidebar-active-fg':         '#C4B5FD',
      '--sidebar-inactive-fg':       '#A1A1AA',
      '--sidebar-user-role':         '#818CF8',
      '--sidebar-avatar-bg':         '#3F3F46',
      '--sidebar-avatar-border':     '#A78BFA',
      '--sidebar-avatar-fg':         '#C4B5FD',
      '--header-bg':                 '#27272A',
      '--header-border':             '#3F3F46',
      '--header-fg':                 '#E4E4E7',
      '--card-bg':                   '#27272A',
      '--card-border':               '#3F3F46',
      '--card-title':                '#E4E4E7',
      '--primary':                   '#A78BFA',
      '--primary-fg':                '#18181B',
      '--muted-fg':                  '#A1A1AA',
      '--subtle-fg':                 '#71717A',
      '--dim-fg':                    '#D4D4D8',
      '--input-bg':                  '#3F3F46',
      '--input-border':              '#52525B',
      '--tag-bg':                    '#3F3F46',
      '--tag-fg':                    '#C4B5FD',
      '--highlight-bg':              '#27272A',
      '--highlight-border':          '#3F3F46',
      '--progress-track':            '#3F3F46',
      '--banner-bg':                 '#3F3F46',
      '--banner-border':             '#52525B',
      '--banner-fg':                 '#C4B5FD',
      '--banner-sub':                '#A1A1AA',
      '--status-pending-bg':         '#3F1F1F',
      '--status-pending-fg':         '#FCA5A5',
      '--status-inprogress-bg':      '#2E2850',
      '--status-inprogress-fg':      '#C4B5FD',
      '--status-done-bg':            '#1A3028',
      '--status-done-fg':            '#6EE7B7',
      '--whiteboard-bg':             '#18181B',
      '--whiteboard-toolbar-bg':     '#27272A',
      '--whiteboard-toolbar-border': '#3F3F46',
      '--whiteboard-dot':            '#3F3F46',
      '--whiteboard-tool-active-bg': '#3F3F46',
      '--whiteboard-tool-active-fg': '#C4B5FD',
      '--whiteboard-tool-fg':        '#71717A',
      '--hero-gradient':             'linear-gradient(135deg, #27272A 0%, #3F3F46 50%, #18181B 100%)',
      '--team-bar-bg':               '#27272A',
      '--team-bar-border':           '#3F3F46',
    },
  },
];

interface ThemeContextValue {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: 'lavanda',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem('flownote-theme') as ThemeId) ?? 'lavanda';
  });

  useEffect(() => {
    const palette = THEMES.find(t => t.id === themeId) ?? THEMES[0];
    const root = document.documentElement;
    Object.entries(palette.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    root.classList.toggle('dark', themeId === 'dark');
    localStorage.setItem('flownote-theme', themeId);
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ themeId, setTheme: setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}