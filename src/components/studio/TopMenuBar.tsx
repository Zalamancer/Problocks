'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Save, Upload, Play, Settings, Sun, Moon } from 'lucide-react';
import { useStudio } from '@/store/studio-store';
import { IconButton, PanelActionButton } from '@/components/ui';

interface MenuItem {
  id: string;
  label: string;
  icon: typeof Save;
  shortcut?: string;
  onClick: () => void;
  separator?: false;
}
interface MenuSeparator { separator: true; }
type MenuEntry = MenuItem | MenuSeparator;

interface DropdownMenu { kind: 'dropdown'; id: string; label: string; items: MenuEntry[]; }
interface DirectButton { kind: 'direct'; id: string; label: string; onClick: () => void; }
type MenuDef = DropdownMenu | DirectButton;

export function TopMenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [hoverMode, setHoverMode] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const { projectName, theme, toggleTheme, games, activeGameId, setViewMode } = useStudio();
  const activeGame = activeGameId ? games.find((g) => g.id === activeGameId) : null;

  useEffect(() => {
    if (!openMenu) return;
    const handler = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null); setHoverMode(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenu]);

  useEffect(() => {
    if (!openMenu) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpenMenu(null); setHoverMode(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [openMenu]);

  const handleMenuClick = useCallback((menuId: string) => {
    setOpenMenu((prev) => {
      if (prev === menuId) { setHoverMode(false); return null; }
      setHoverMode(true);
      return menuId;
    });
  }, []);

  const handleMenuHover = useCallback((menuId: string) => {
    if (hoverMode && openMenu) setOpenMenu(menuId);
  }, [hoverMode, openMenu]);

  const handleItemClick = useCallback((item: MenuItem) => {
    item.onClick(); setOpenMenu(null); setHoverMode(false);
  }, []);

  const menus: MenuDef[] = [
    {
      kind: 'dropdown',
      id: 'file',
      label: 'File',
      items: [
        { id: 'new',     label: 'New Game',               icon: Play,   shortcut: '⌘N', onClick: () => { useStudio.getState().setActiveGameId(null); } },
        { separator: true },
        { id: 'save',    label: 'Save',                   icon: Save,   shortcut: '⌘S', onClick: () => {} },
        { id: 'publish', label: 'Publish to Marketplace', icon: Upload,                 onClick: () => {} },
      ],
    },
    { kind: 'direct', id: 'marketplace', label: 'Marketplace', onClick: () => { window.location.href = '/marketplace'; } },
    { kind: 'direct', id: 'classroom',   label: 'Classroom',   onClick: () => {} },
  ];

  return (
    <div
      ref={barRef}
      className="relative z-50 flex items-center h-9 bg-zinc-900/60 backdrop-blur-xl border border-white/[0.06] rounded-xl shrink-0 select-none"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 border-r border-white/[0.06] h-full">
        <div className="h-4 w-4 rounded bg-accent shrink-0" />
        <span className="text-xs font-bold text-white">Problocks</span>
      </div>

      {/* Menu buttons */}
      <div className="flex items-center h-full">
        {menus.map((menu) =>
          menu.kind === 'dropdown' ? (
            <DropdownMenuButton
              key={menu.id}
              menu={menu}
              isOpen={openMenu === menu.id}
              onClick={() => handleMenuClick(menu.id)}
              onHover={() => handleMenuHover(menu.id)}
              onItemClick={handleItemClick}
            />
          ) : (
            <DirectMenuButton
              key={menu.id}
              menu={menu as DirectButton}
              onClick={() => { setOpenMenu(null); setHoverMode(false); (menu as DirectButton).onClick(); }}
              onHover={() => handleMenuHover(menu.id)}
            />
          ),
        )}
      </div>

      <div className="flex-1" />

      {/* Active game name — absolutely centered in the bar */}
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-xs font-medium text-zinc-300 truncate max-w-[220px]">
        {activeGame?.name ?? projectName}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 pr-2">
        <IconButton
          icon={theme === 'dark' ? Sun : Moon}
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          tooltip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        />
        <PanelActionButton onClick={() => {}} variant="primary" icon={Upload} size="sm">
          Publish
        </PanelActionButton>
        <IconButton
          icon={Settings}
          variant="ghost"
          size="sm"
          tooltip="Settings"
          onClick={() => setViewMode('settings')}
        />
      </div>
    </div>
  );
}

function DropdownMenuButton({ menu, isOpen, onClick, onHover, onItemClick }: {
  menu: DropdownMenu; isOpen: boolean; onClick: () => void; onHover: () => void;
  onItemClick: (item: MenuItem) => void;
}) {
  return (
    <div className="relative h-full flex items-center" onMouseEnter={onHover}>
      <button
        onClick={onClick}
        className={cn(
          'px-3 h-7 text-xs font-medium rounded-md mx-0.5 transition-colors',
          isOpen ? 'bg-panel-surface text-white' : 'text-gray-400 hover:text-white hover:bg-panel-surface',
        )}
      >
        {menu.label}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 z-dropdown min-w-[200px] py-1 bg-panel-bg border border-white/10 rounded-xl shadow-2xl mt-1">
          {menu.items.map((entry, i) => {
            if ((entry as MenuSeparator).separator)
              return <div key={`sep-${i}`} className="my-1 border-t border-white/5" />;
            const item = entry as MenuItem;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onItemClick(item)}
                className="flex items-center gap-3 px-3 py-2 text-xs text-gray-300 hover:bg-panel-surface hover:text-white transition-colors rounded-md mx-1 w-[calc(100%-8px)]"
              >
                <Icon size={13} className="shrink-0 text-gray-500" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.shortcut && <span className="text-[10px] text-gray-600">{item.shortcut}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DirectMenuButton({ menu, onClick, onHover }: {
  menu: DirectButton; onClick: () => void; onHover: () => void;
}) {
  return (
    <div className="h-full flex items-center" onMouseEnter={onHover}>
      <button
        onClick={onClick}
        className="px-3 h-7 text-xs font-medium text-gray-400 hover:text-white hover:bg-panel-surface transition-colors rounded-md mx-0.5"
      >
        {menu.label}
      </button>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
