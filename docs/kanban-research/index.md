# Kanban Board Research — Overview & Library Comparison

> Research date: April 2026. All library data current as of this date.

---

## 1. Core Kanban Concepts

### Columns (Swimlane Stages)

Columns represent workflow stages. Cards move left-to-right through columns. Most boards use 3–7 columns. Typical set:

| Column | Meaning |
|--------|---------|
| Backlog | Captured but not yet scheduled |
| To Do | Planned for current sprint/cycle |
| In Progress | Actively being worked on |
| In Review | Awaiting approval / PR review |
| Done | Completed |
| Blocked | Stuck — waiting on external dependency |

Each column has:
- A `status` key (used as the column's identity)
- A display title and optional color
- An ordered list of card IDs
- An optional WIP limit

### Cards

Cards are the atomic unit of work. Each card belongs to exactly one column at a time. Key properties: ID, title, status (mirrors the column), priority, assignee, labels, due date, subtasks, description, comments, attachments, and dependency links (blocks / blocked-by).

### Swimlanes

Swimlanes are horizontal rows that cut across all columns. They group cards by a secondary dimension — typically team, epic, priority tier, or person. Example: rows for "Frontend", "Backend", "Design" cutting across the standard To Do → Done columns.

Swimlanes are implemented as a second grouping key on each card. A `swimlaneId` field on the card references a `Swimlane` entity. The board renders `columns × swimlanes` cells.

### WIP Limits

WIP (Work in Progress) limits cap the number of cards allowed in a column (or swimlane cell). When a column exceeds its limit:
- The column header turns red / shows a warning badge
- Ideally drag-and-drop should soft-block the move with a visual indicator (not hard-block — allow override)

Implementation: store `wipLimit: number | null` on each column. On render, compare `column.cardIds.length` to `column.wipLimit` and apply a `data-over-wip` attribute or class.

### Card States

Cards should carry an explicit `status` field that always reflects which column they are in. Derived states:
- **Blocked** — at least one `blockedBy` dependency is not `done`
- **Ready** — all dependencies are done, card is in To Do or Backlog
- **Overdue** — `dueDate` is in the past and card is not done

---

## 2. Drag-and-Drop Library Comparison

### Quick Reference Table

| Library | Weekly DLs | Bundle (min+gz) | React 19 | Maintenance | Kanban-fit |
|---------|-----------|-----------------|----------|-------------|------------|
| `@dnd-kit/core` + `@dnd-kit/sortable` | ~2.5M | ~26 kB core, ~10 kB sortable | ✅ | Active | ★★★★★ |
| `@hello-pangea/dnd` | ~600K | ~30 kB | ✅ | Active (community fork) | ★★★★☆ |
| `@atlaskit/pragmatic-drag-and-drop` | ~300K | ~4.7 kB core | ✅ | Active (Atlassian) | ★★★☆☆ |
| `react-beautiful-dnd` | declining | ~30 kB | ❌ | **Deprecated / archived Aug 2025** | ✗ |
| `@formkit/drag-and-drop` | low | ~5 kB | ✅ | Experimental (v0.3) | ★★☆☆☆ |

---

### 2.1 @dnd-kit/core + @dnd-kit/sortable

**The recommended choice** for new kanban boards in 2025+.

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Architecture:** Three-tier. `@dnd-kit/core` provides the context, sensors, collision detection, and overlay. `@dnd-kit/sortable` is a preset layer on top that adds `useSortable`, `SortableContext`, and `arrayMove`. `@dnd-kit/utilities` provides the `CSS` helper.

**Core API:**

```tsx
import {
  DndContext,
  DragOverlay,
  closestCorners,        // collision detection
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
```

**Sensors:** Sensors abstract the input method. For a kanban board, configure both pointer and keyboard:

```tsx
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5, // must drag 5px before activating — prevents accidental drags
    },
  }),
  useSensor(KeyboardSensor)
);
```

**DragOverlay** — renders a floating ghost card during drag. Always stays mounted; conditionally render its children:

```tsx
const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);

<DndContext
  sensors={sensors}
  collisionDetection={closestCorners}
  onDragStart={({ active }) => setActiveCard(cardsById[active.id])}
  onDragEnd={handleDragEnd}
  onDragOver={handleDragOver}
>
  {/* ... board ... */}
  <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
    {activeCard ? <CardPreview card={activeCard} /> : null}
  </DragOverlay>
</DndContext>
```

**useSortable hook** — combines draggable + droppable. Returns:

```tsx
const {
  attributes,   // aria-* props
  listeners,    // onPointerDown, onKeyDown etc
  setNodeRef,   // ref callback
  transform,    // displacement transform
  transition,   // CSS transition string
  isDragging,   // boolean — hide source while DragOverlay is shown
} = useSortable({ id: card.id, data: { type: 'card', columnId } });

const style = {
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isDragging ? 0 : 1, // hide original while overlay is shown
};
```

**Multi-column pattern (the canonical approach):**

```tsx
// One SortableContext per column, all nested inside one DndContext
<DndContext onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
  <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
    {columns.map(col => (
      <Column key={col.id}>
        <SortableContext items={col.cardIds} strategy={verticalListSortingStrategy}>
          {col.cardIds.map(id => <Card key={id} card={cardsById[id]} />)}
        </SortableContext>
      </Column>
    ))}
  </SortableContext>
</DndContext>
```

**onDragOver vs onDragEnd:** Use `onDragOver` for live cross-column preview (moves the card in state immediately as you hover), and `onDragEnd` to commit the final position. This is the correct UX for a kanban board — cards jump into the target column visually as you hover.

**Collision detection:** Use `closestCorners` for kanban (not `rectIntersection`). It handles the case where an empty column needs to receive cards — `rectIntersection` misses narrow targets.

**Pros:**
- Extremely flexible — works with grids, lists, trees, free-form canvases
- Accessibility built-in (keyboard navigation, ARIA)
- DragOverlay decouples visual feedback from DOM structure (critical for cross-container moves)
- Virtualization support via `verticalListSortingStrategy`
- Active maintainer, React 19 compatible
- Tree-shakeable, modular packages

**Cons:**
- More boilerplate than hello-pangea/dnd for simple cases
- No built-in desktop file drag support
- Single-window only (no cross-window dragging)
- Medium learning curve for multi-container scenarios

---

### 2.2 @hello-pangea/dnd

Community-maintained fork of the archived `react-beautiful-dnd`. Drop-in replacement (just change imports).

```bash
npm install @hello-pangea/dnd
# TypeScript types are bundled
```

**Version:** 18.0.1 (Feb 2025). React 18 and 19 compatible.

**API:**

```tsx
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';

<DragDropContext onDragEnd={onDragEnd}>
  {columns.map(col => (
    <Droppable droppableId={col.id} key={col.id}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{ background: snapshot.isDraggingOver ? '#e2e8f0' : 'white' }}
        >
          {col.cardIds.map((cardId, index) => (
            <Draggable draggableId={cardId} index={index} key={cardId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    ...provided.draggableProps.style,
                    rotate: snapshot.isDragging ? '2deg' : '0deg',
                    boxShadow: snapshot.isDragging ? '0 8px 20px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  <CardComponent card={cardsById[cardId]} />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  ))}
</DragDropContext>
```

**The `onDragEnd` handler:**

```tsx
function onDragEnd(result: DropResult) {
  const { source, destination, draggableId } = result;
  if (!destination) return; // dropped outside
  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) return; // no change

  // Update your state here
  moveCard(draggableId, source.droppableId, destination.droppableId, destination.index);
}
```

**Pros:**
- Polished, physically-weighted animations out of the box
- Very simple API for list-based boards
- `isDraggingOver` and `isDragging` state provided automatically
- Virtual list support (10,000+ items at 60fps)
- Battle-tested — runs in production at Atlassian scale

**Cons:**
- No grid support — lists only
- No DragOverlay equivalent; the original DOM node moves
- Heavier than pragmatic-drag-and-drop
- Less flexible than dnd-kit for custom interactions
- Community-maintained — not Atlassian-backed going forward

---

### 2.3 @atlaskit/pragmatic-drag-and-drop

Atlassian's successor to react-beautiful-dnd. Powers Trello, Jira, and Confluence.

```bash
npm install @atlaskit/pragmatic-drag-and-drop
# Optional addons:
npm install @atlaskit/pragmatic-drag-and-drop-hitbox         # edge detection
npm install @atlaskit/pragmatic-drag-and-drop-react-drop-indicator  # visual indicators
npm install @atlaskit/pragmatic-drag-and-drop-auto-scroll    # auto-scroll during drag
```

**Core API (imperative, ref-based — NOT hook-based):**

```tsx
import { draggable, dropTargetForElements, monitorForElements } from
  '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

// In a Card component:
useEffect(() => {
  const el = ref.current;
  return combine(
    draggable({
      element: el,
      getInitialData: () => ({ type: 'card', cardId: card.id, columnId }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    }),
    dropTargetForElements({
      element: el,
      getData: ({ input }) => attachClosestEdge(
        { type: 'card', cardId: card.id },
        { element: el, input, allowedEdges: ['top', 'bottom'] }
      ),
    }),
  );
}, [card.id]);

// In a Board component:
useEffect(() => {
  return monitorForElements({
    onDrop: ({ source, location }) => {
      const { cardId } = source.data;
      const targets = location.current.dropTargets;
      // handle based on targets.length (1 = column, 2 = card in column)
    },
  });
}, []);
```

**Key differences from dnd-kit:**
- ~4.7 kB core (vs ~26 kB for dnd-kit core) — significantly smaller
- Framework-agnostic — works in Vue, Svelte, vanilla JS
- Imperative cleanup-function style (not hook-based)
- Built-in cross-window dragging support
- Built-in file drop support
- Lazy-loadable
- More verbose setup for complex scenarios
- Documentation is sparser than dnd-kit

**Pros:** Smallest bundle, framework-agnostic, powers Atlassian products
**Cons:** More verbose, sparser docs, emerging community, no hook API

---

### 2.4 react-beautiful-dnd — DO NOT USE

Archived by Atlassian on August 18, 2025. No React 19 support. Console warnings on install. Use `@hello-pangea/dnd` as a drop-in replacement (change imports only) or migrate to dnd-kit.

---

### 2.5 @formkit/drag-and-drop

```bash
npm install @formkit/drag-and-drop
```

~5 kB gzipped. Minimal plugin-based API. Still at v0.3 — experimental. Limited accessibility. Not recommended for production kanban boards in 2025.

---

### Which Library to Choose

**For this project (Problocks):** Use **`@dnd-kit/core` + `@dnd-kit/sortable`**.

Reasons:
1. React 19 compatible (your stack uses React 19)
2. Works alongside `@xyflow/react` without conflicts (both use React refs and state — no competing global event handlers)
3. DragOverlay is essential for cards that move between columns — the ghost card must persist while the original unmounts from its column
4. Most tutorials, examples, and Stack Overflow answers target dnd-kit as of 2025
5. The `data` field on draggable items lets you attach arbitrary metadata (card type, column ID, position) — critical for the dual kanban/flowchart use case

---

## 3. Related Libraries Worth Knowing

| Library | Purpose | Use When |
|---------|---------|---------|
| `dagre` | Auto-layout for DAGs | React Flow flowchart view |
| `@tanstack/react-virtual` | Virtualize long card lists | >200 cards per column |
| `date-fns` | Date formatting for due dates | Always |
| `@radix-ui/react-dialog` | Card detail modal | Use if not using shadcn/ui |
| `normalizr` | Normalize API response → store shape | When fetching from backend |
| `immer` | Immutable state updates | Zustand middleware for complex mutations |

---

## Sources

- [LogRocket: Build a Kanban board with dnd-kit](https://blog.logrocket.com/build-kanban-board-dnd-kit-react/)
- [dnd-kit React Quickstart](https://dndkit.com/react/quickstart)
- [dnd-kit Sortable Preset](https://dndkit.com/presets/sortable)
- [dnd-kit DragOverlay API](https://dndkit.com/legacy/api-documentation/draggable/drag-overlay)
- [Puck: Top 5 Drag-and-Drop Libraries for React 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)
- [@hello-pangea/dnd GitHub](https://github.com/hello-pangea/dnd)
- [LogRocket: Pragmatic drag and drop](https://blog.logrocket.com/implement-pragmatic-drag-drop-library-guide/)
- [Atlassian: pragmatic-drag-and-drop GitHub](https://github.com/atlassian/pragmatic-drag-and-drop)
- [react-beautiful-dnd deprecation issue](https://github.com/atlassian/react-beautiful-dnd/issues/2672)
- [Marmelab: Building a Kanban Board with Shadcn (Jan 2026)](https://marmelab.com/blog/2026/01/15/building-a-kanban-board-with-shadcn.html)
- [Chetanverma: How to create a Kanban board using dnd-kit](https://www.chetanverma.com/blog/how-to-create-an-awesome-kanban-board-using-dnd-kit)
