# Kanban UI Patterns — Card Anatomy, Column Patterns, Interactions

---

## 1. Card Anatomy

A kanban card is a miniature summary of a task. The challenge is surfacing the right information at a glance without clutter.

### 1.1 Card Visual Hierarchy

```
┌─────────────────────────────────────┐
│ [Priority dot] [Labels...]          │  ← top metadata row
│                                     │
│ Title of the task (truncated at 2   │  ← title (primary content)
│ lines with ellipsis)                │
│                                     │
│ [Progress bar if subtasks > 0]      │  ← optional progress
│                                     │
│ [Avatar] [Avatar]  📎2  💬3  ⚡      │  ← footer row
│                    Due: Apr 15      │
└─────────────────────────────────────┘
```

**Priority dot** — colored 4×4px circle in top-left corner:
- `urgent` → red-500
- `high` → orange-400
- `medium` → yellow-400
- `low` → blue-400
- `none` → transparent / gray-600

**Labels** — 2–3 visible max; overflow badge (+N more):
- Small pill, 12px text, colored background
- Click opens filter for that label

**Title** — 2-line clamp, 14px semibold. Click opens card detail modal.

**Footer row** — right-aligned icons with count badges:
- Assignee avatars (stack up to 3, then +N)
- Paperclip icon + attachment count
- Comment bubble + comment count
- Lightning bolt (⚡) if card is blocked — amber color, tooltip shows blocking cards
- Clock icon if overdue — red color

### 1.2 Card Component (React + dnd-kit + Tailwind)

```tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CardProps {
  card: KanbanCard;
  cardsById: Record<string, KanbanCard>;
  onClick: () => void;
}

export function KanbanCardComponent({ card, cardsById, onClick }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', columnId: card.columnId },
  });

  const blocked = isCardBlocked(card, cardsById);
  const overdue = isCardOverdue(card);
  const progress = getSubtaskProgress(card);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,  // hide original while DragOverlay renders ghost
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        group relative rounded-lg border bg-zinc-800 border-white/[0.06] p-3
        cursor-grab active:cursor-grabbing select-none
        hover:border-white/[0.12] hover:bg-zinc-750
        transition-colors duration-100
        ${blocked ? 'border-l-2 border-l-amber-500' : ''}
        ${overdue ? 'border-l-2 border-l-red-500' : ''}
      `}
    >
      {/* Top row: priority + labels */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <PriorityDot priority={card.priority} />
        {card.labels.slice(0, 3).map(label => (
          <LabelPill key={label.id} label={label} />
        ))}
        {card.labels.length > 3 && (
          <span className="text-[11px] text-zinc-500">+{card.labels.length - 3}</span>
        )}
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-zinc-200 line-clamp-2 mb-2 leading-snug">
        {card.title}
      </p>

      {/* Subtask progress bar */}
      {card.subtasks.length > 0 && (
        <div className="mb-2">
          <div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 inline-block">
            {card.subtasks.filter(s => s.completed).length}/{card.subtasks.length}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-1">
        {/* Assignee avatars */}
        <div className="flex -space-x-1.5">
          {card.assignees.slice(0, 3).map(a => (
            <AssigneeAvatar key={a.id} assignee={a} size="sm" />
          ))}
        </div>

        <div className="flex items-center gap-2 text-zinc-500">
          {card.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[11px]">
              <PaperclipIcon size={11} />
              {card.attachments.length}
            </span>
          )}
          {card.comments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[11px]">
              <MessageCircleIcon size={11} />
              {card.comments.length}
            </span>
          )}
          {blocked && (
            <span className="text-amber-400" title="Blocked">
              <ZapIcon size={12} />
            </span>
          )}
          {card.dueDate && (
            <DueDateBadge dueDate={card.dueDate} isOverdue={overdue} />
          )}
        </div>
      </div>
    </div>
  );
}
```

### 1.3 Card Ghost (DragOverlay Preview)

The drag ghost should look slightly elevated — scaled up, shadow added, rotated ~1.5°:

```tsx
export function CardDragGhost({ card }: { card: KanbanCard }) {
  return (
    <div
      className="rounded-lg border border-white/20 bg-zinc-800 p-3 shadow-2xl
                 rotate-[1.5deg] scale-[1.03] pointer-events-none"
    >
      {/* Same content as card, but simplified — no hover states, no listeners */}
      <p className="text-sm font-medium text-zinc-200 line-clamp-2">{card.title}</p>
    </div>
  );
}

// In board root:
<DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.2, 0, 0, 1)' }}>
  {activeCard ? <CardDragGhost card={activeCard} /> : null}
</DragOverlay>
```

---

## 2. Column Patterns

### 2.1 Column Header

```
┌──────────────────────────────────────┐
│ ● In Progress    3/5  [+]  [⋮]      │
└──────────────────────────────────────┘
```

- **Color dot** (left): column accent color (optional, per-column config)
- **Title**: editable inline (double-click to edit)
- **Count badge**: `{count}/{wipLimit}` or just `{count}` if no limit
  - Green when at or under limit
  - Red when over limit
- **[+] button**: quick-add card to top/bottom of column
- **[⋮] menu**: rename, set WIP limit, collapse, delete

```tsx
function ColumnHeader({ column, count }: { column: KanbanColumn; count: number }) {
  const isOverWip = column.wipLimit != null && count > column.wipLimit;

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06]">
      {column.color && (
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: column.color }} />
      )}

      <span className="text-sm font-semibold text-zinc-200 flex-1 truncate">
        {column.title}
      </span>

      {/* WIP badge */}
      <span className={`text-xs font-mono px-1.5 py-0.5 rounded-md tabular-nums
        ${isOverWip
          ? 'bg-red-500/20 text-red-400'
          : 'bg-zinc-700 text-zinc-400'
        }`}
      >
        {column.wipLimit != null ? `${count}/${column.wipLimit}` : count}
      </span>

      <button
        className="w-6 h-6 flex items-center justify-center rounded text-zinc-500
                   hover:text-zinc-200 hover:bg-zinc-700"
        onClick={onAddCard}
      >
        <PlusIcon size={14} />
      </button>

      <ColumnMenu column={column} />
    </div>
  );
}
```

### 2.2 WIP Limit Enforcement

Soft enforcement only (hard blocks are frustrating). When a card is dragged to an over-limit column:
- Show a red overlay/border on the column
- Allow the drop anyway
- Show a toast: "In Progress is over its WIP limit (4/3)"

```tsx
// In the column droppable wrapper:
<div
  ref={setNodeRef}
  className={`
    flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-2
    ${isOver && targetIsOverWip ? 'ring-2 ring-red-500/50 rounded-b-lg' : ''}
  `}
>
```

### 2.3 Quick-Add Card (Inline Input)

When user clicks [+], reveal an inline input at the bottom of the column. Press Enter to commit, Escape to cancel.

```tsx
function QuickAddCard({
  columnId,
  onAdd,
  onCancel,
}: {
  columnId: string;
  onAdd: (title: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (title.trim()) onAdd(title.trim());
      else onCancel();
    }
    if (e.key === 'Escape') onCancel();
  }

  return (
    <div className="rounded-lg border border-white/10 bg-zinc-800/80 p-2 mt-1">
      <textarea
        ref={inputRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Card title..."
        rows={2}
        className="w-full bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600
                   resize-none outline-none"
      />
      <div className="flex gap-2 mt-1.5">
        <button
          className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-500"
          onClick={() => title.trim() && onAdd(title.trim())}
        >
          Add card
        </button>
        <button
          className="text-xs px-2 py-1 rounded text-zinc-400 hover:text-zinc-200"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
```

### 2.4 Empty Column Droppable State

Empty columns need a visible drop target or cards can't be moved there:

```tsx
{column.cardIds.length === 0 && (
  <div
    className={`
      flex-1 min-h-[80px] rounded-lg border-2 border-dashed m-2
      flex items-center justify-center text-xs text-zinc-600
      transition-colors duration-100
      ${isOver ? 'border-accent/50 bg-accent/5 text-accent' : 'border-zinc-700'}
    `}
  >
    {isOver ? 'Drop here' : 'Empty'}
  </div>
)}
```

### 2.5 Column Collapse

Columns can be collapsed to a vertical strip showing only the title and count. Useful for "Done" or "Backlog" columns that don't need constant visibility.

```tsx
{column.isCollapsed ? (
  <div className="w-10 flex flex-col items-center py-4 gap-2 border-r border-white/[0.06]">
    <span className="text-xs text-zinc-500 font-mono">{count}</span>
    <span
      className="text-sm font-semibold text-zinc-400 [writing-mode:vertical-rl] rotate-180"
      style={{ userSelect: 'none' }}
    >
      {column.title}
    </span>
    <button onClick={() => updateColumn(column.id, { isCollapsed: false })}>
      <ChevronRightIcon size={14} className="text-zinc-600" />
    </button>
  </div>
) : (
  <FullColumn column={column} />
)}
```

---

## 3. Filter & Sort Bar

Render above the board columns, full-width.

```
┌─────────────────────────────────────────────────────────────────┐
│ [🔍 Search cards...]  [👤 Assignee ▾]  [🏷 Labels ▾]  [⚡ Blocked]  │
│ [Priority ▾]  [Due date ▾]  ─────────────────  Sort: Priority ▾ │
└─────────────────────────────────────────────────────────────────┘
```

```tsx
function FilterBar() {
  const { filterState, setFilter, sortState, setSort } = useKanbanStore(
    s => ({ filterState: s.ui.filterState, setFilter: s.setFilter,
            sortState: s.ui.sortState, setSort: s.setSort })
  );

  const activeFilterCount = [
    filterState.assigneeIds.length > 0,
    filterState.labelIds.length > 0,
    filterState.priorities.length > 0,
    filterState.showBlockedOnly,
    !!filterState.dueDateRange,
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06] flex-wrap">
      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
        <input
          value={filterState.search}
          onChange={e => setFilter({ search: e.target.value })}
          placeholder="Search cards..."
          className="pl-7 pr-3 py-1 text-sm bg-zinc-800 rounded-md border border-white/[0.08]
                     text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-accent/50
                     w-48"
        />
      </div>

      {/* Filter dropdowns */}
      <AssigneeFilter />
      <LabelFilter />
      <PriorityFilter />

      {/* Blocked toggle */}
      <button
        onClick={() => setFilter({ showBlockedOnly: !filterState.showBlockedOnly })}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs
          ${filterState.showBlockedOnly
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'bg-zinc-800 text-zinc-400 border border-white/[0.08]'}`}
      >
        <ZapIcon size={11} />
        Blocked
      </button>

      {/* Active filter indicator */}
      {activeFilterCount > 0 && (
        <button
          onClick={() => setFilter({ assigneeIds: [], labelIds: [], priorities: [],
                                     showBlockedOnly: false, dueDateRange: undefined, search: '' })}
          className="text-xs text-zinc-400 hover:text-zinc-200 ml-1"
        >
          Clear filters ({activeFilterCount})
        </button>
      )}

      {/* Sort — pushed to right */}
      <div className="ml-auto">
        <SortDropdown value={sortState} onChange={setSort} />
      </div>
    </div>
  );
}
```

---

## 4. Card Detail Modal / Sidebar

Opening a card shows a full-screen overlay sidebar (right-side panel), not a centered modal. This keeps the board visible in background.

### 4.1 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [Board: Game Dev]  ›  [In Progress]  ›  card-title      [✕]    │
├────────────────────────────────────────┬────────────────────────┤
│ Title (editable h1)                    │ Assignees              │
│                                        │ Priority               │
│ Description (markdown editor)          │ Labels                 │
│                                        │ Due date               │
│ ── Subtasks ───────────────────────── │ Created / Updated      │
│ [✓] Task 1  [✕]                       │                        │
│ [ ] Task 2  [✕]                       │ ── Dependencies ──────  │
│ [+ Add subtask]                        │ Blocked by: card-1 [✕] │
│                                        │ Blocks: none           │
│ ── Comments ────────────────────────  │ [+ Add dependency]     │
│ Avatar  Name · 2h ago                 │                        │
│   "This is a comment body"            │ ── Linked Nodes ──────  │
│ [Comment input...]                     │ PixelLab Node ⇒       │
└────────────────────────────────────────┴────────────────────────┘
```

### 4.2 Opening / Closing

```tsx
// In store
selectCard: (cardId: string | null) => void;

// In board component
const selectedCard = useKanbanStore(selectSelectedCard);

// Render
{selectedCard && (
  <CardDetailSidebar
    card={selectedCard}
    onClose={() => selectCard(null)}
  />
)}
```

Use `Escape` key to close:
```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, [onClose]);
```

### 4.3 Inline Editing

All fields in the detail view are editable inline — clicking a field transforms it into an input:

```tsx
function EditableTitle({ card }: { card: KanbanCard }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(card.title);
  const updateCard = useKanbanStore(s => s.updateCard);

  function commit() {
    if (value.trim() && value !== card.title) {
      updateCard(card.id, { title: value.trim() });
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        className="text-xl font-semibold text-zinc-100 bg-zinc-800/50 rounded px-1 w-full
                   border border-accent/50 outline-none"
      />
    );
  }

  return (
    <h2
      onClick={() => setEditing(true)}
      className="text-xl font-semibold text-zinc-100 cursor-text hover:bg-zinc-800/50
                 rounded px-1 -mx-1 transition-colors"
    >
      {card.title}
    </h2>
  );
}
```

### 4.4 Subtask List

```tsx
function SubtaskList({ card }: { card: KanbanCard }) {
  const updateCard = useKanbanStore(s => s.updateCard);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  function toggleSubtask(subtaskId: string, completed: boolean) {
    updateCard(card.id, {
      subtasks: card.subtasks.map(s =>
        s.id === subtaskId ? { ...s, completed } : s
      ),
    });
  }

  function addSubtask() {
    if (!newTitle.trim()) return;
    updateCard(card.id, {
      subtasks: [...card.subtasks, {
        id: crypto.randomUUID(),
        title: newTitle.trim(),
        completed: false,
      }],
    });
    setNewTitle('');
    setAdding(false);
  }

  return (
    <section>
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
        Subtasks ({card.subtasks.filter(s => s.completed).length}/{card.subtasks.length})
      </h3>

      <div className="space-y-1">
        {card.subtasks.map(s => (
          <div key={s.id} className="flex items-center gap-2 group">
            <input
              type="checkbox"
              checked={s.completed}
              onChange={e => toggleSubtask(s.id, e.target.checked)}
              className="rounded border-zinc-600"
            />
            <span className={`text-sm flex-1 ${s.completed ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
              {s.title}
            </span>
            <button
              className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-400"
              onClick={() => updateCard(card.id, {
                subtasks: card.subtasks.filter(st => st.id !== s.id)
              })}
            >
              <XIcon size={12} />
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="flex gap-2 mt-2">
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addSubtask(); if (e.key === 'Escape') setAdding(false); }}
            placeholder="Subtask title..."
            className="text-sm bg-zinc-800 border border-white/[0.08] rounded px-2 py-1 flex-1
                       text-zinc-200 outline-none focus:border-accent/50"
          />
          <button className="text-xs bg-green-600 text-white px-2 py-1 rounded" onClick={addSubtask}>
            Add
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-xs text-zinc-500 hover:text-zinc-300 mt-2 flex items-center gap-1"
        >
          <PlusIcon size={12} /> Add subtask
        </button>
      )}
    </section>
  );
}
```

---

## 5. Blocked Card Visual Treatment

Cards blocked by unfinished dependencies need to stand out clearly.

**Card in column:**
- Left border: 2px amber-500 strip
- Small lightning bolt icon in footer (amber)
- Slightly desaturated background: `bg-zinc-800/70`

**Card detail sidebar — dependency section:**
```tsx
function DependencySection({ card, cardsById }: { card: KanbanCard; cardsById: Record<string, KanbanCard> }) {
  const blockers = card.blockedBy
    .map(id => cardsById[id])
    .filter(Boolean);

  const blocking = card.blocks
    .map(id => cardsById[id])
    .filter(Boolean);

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        Dependencies
      </h3>

      {/* Blocked by */}
      {blockers.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 mb-1">Blocked by</p>
          <div className="space-y-1">
            {blockers.map(blocker => (
              <div key={blocker.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs
                  ${blocker.status !== 'done'
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                    : 'bg-zinc-800 text-zinc-500 line-through'
                  }`}
              >
                {blocker.status !== 'done' && <ZapIcon size={11} />}
                {blocker.status === 'done' && <CheckCircleIcon size={11} className="text-green-500" />}
                <span className="flex-1 truncate">{blocker.title}</span>
                <button onClick={() => removeDependency(card.id, blocker.id)}>
                  <XIcon size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blocks */}
      {blocking.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 mb-1">Blocks</p>
          <div className="space-y-1">
            {blocking.map(dep => (
              <div key={dep.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded bg-zinc-800 border
                           border-white/[0.06] text-xs text-zinc-400"
              >
                <ArrowRightIcon size={11} />
                <span className="flex-1 truncate">{dep.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add dependency */}
      <AddDependencyButton cardId={card.id} />
    </section>
  );
}
```

---

## 6. Board-Level Layout

```tsx
function KanbanBoardView() {
  const columns = useKanbanStore(selectActiveColumns);
  const cardsById = useKanbanStore(s => s.cards.byId);
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  return (
    <div className="flex flex-col h-full">
      <FilterBar />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => {
          setActiveCard(cardsById[active.id] ?? null);
        }}
        onDragOver={handleDragOver}   // live cross-column preview
        onDragEnd={(e) => {
          handleDragEnd(e);
          setActiveCard(null);
        }}
      >
        {/* Horizontal scrollable column track */}
        <div className="flex-1 flex gap-3 overflow-x-auto px-4 py-3 min-h-0">
          <SortableContext
            items={columns.map(c => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map(col => (
              <KanbanColumn key={col.id} column={col} />
            ))}
          </SortableContext>

          {/* Add column button */}
          <AddColumnButton />
        </div>

        {/* Ghost card during drag */}
        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.2, 0, 0, 1)' }}>
          {activeCard ? <CardDragGhost card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Card detail sidebar */}
      <CardDetailSidebar />
    </div>
  );
}
```

### 6.1 handleDragOver (live cross-column preview)

```typescript
function handleDragOver(event: DragOverEvent) {
  const { active, over } = event;
  if (!over) return;

  const activeId = active.id as string;
  const overId = over.id as string;

  const activeCard = cardsById[activeId];
  if (!activeCard) return;

  // Figure out target column
  let targetColumnId: string;
  if (columnsById[overId]) {
    // Dropped directly onto a column header/empty area
    targetColumnId = overId;
  } else {
    // Dropped onto another card — use that card's column
    const overCard = cardsById[overId];
    if (!overCard) return;
    targetColumnId = overCard.columnId;
  }

  if (activeCard.columnId === targetColumnId) return; // same column — no update needed

  // Move card to target column at end (will be refined in onDragEnd)
  const targetCol = columnsById[targetColumnId];
  moveCard(activeId, targetColumnId, targetCol.cardIds.length);
}
```

### 6.2 handleDragEnd (commit final position)

```typescript
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!over) return;

  const activeId = active.id as string;
  const overId = over.id as string;

  const activeCard = cardsById[activeId];
  if (!activeCard) return;

  if (activeId === overId) return;

  // If dropping onto a card in the same column, reorder
  const overCard = cardsById[overId];
  if (overCard && overCard.columnId === activeCard.columnId) {
    const col = columnsById[activeCard.columnId];
    const oldIndex = col.cardIds.indexOf(activeId);
    const newIndex = col.cardIds.indexOf(overId);
    if (oldIndex !== newIndex) {
      const newCardIds = arrayMove(col.cardIds, oldIndex, newIndex);
      updateColumn(activeCard.columnId, { cardIds: newCardIds });
    }
  }
}
```

---

## 7. View Mode Toggle

Add a view mode switcher to the board header:

```tsx
function ViewToggle() {
  const { viewMode, setViewMode } = useKanbanStore(s => ({
    viewMode: s.ui.viewMode,
    setViewMode: s.setViewMode,
  }));

  const modes = [
    { id: 'kanban', icon: LayoutIcon, label: 'Board' },
    { id: 'flowchart', icon: GitBranchIcon, label: 'Graph' },
    { id: 'list', icon: ListIcon, label: 'List' },
  ] as const;

  return (
    <div className="flex items-center gap-0.5 bg-zinc-800 rounded-lg p-0.5 border border-white/[0.06]">
      {modes.map(m => (
        <button
          key={m.id}
          onClick={() => setViewMode(m.id)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium
            transition-all duration-150
            ${viewMode === m.id
              ? 'bg-white/10 text-zinc-100 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
            }`}
        >
          <m.icon size={13} />
          {m.label}
        </button>
      ))}
    </div>
  );
}
```

---

## Sources

- [Marmelab: Kanban Board with Shadcn (2026)](https://marmelab.com/blog/2026/01/15/building-a-kanban-board-with-shadcn.html)
- [LogRocket: dnd-kit kanban](https://blog.logrocket.com/build-kanban-board-dnd-kit-react/)
- [Chetanverma: dnd-kit kanban](https://www.chetanverma.com/blog/how-to-create-an-awesome-kanban-board-using-dnd-kit)
- [dnd-kit DragOverlay API](https://dndkit.com/legacy/api-documentation/draggable/drag-overlay)
- [dnd-kit Sortable Preset](https://dndkit.com/presets/sortable)
- [WIP limits: Businessmap Knowledge Base](https://knowledgebase.businessmap.io/hc/en-us/articles/360019128471-What-Is-a-WIP-Limit-and-How-to-Set-It-Up)
- [Syncfusion WIP Validation in React Kanban](https://ej2.syncfusion.com/react/documentation/kanban/validation)
- [Kanban cards best practices (Wrike)](https://www.wrike.com/kanban-guide/kanban-cards/)
