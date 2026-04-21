import { BlocksGameShell } from '@/components/scratch/BlocksGameShell';

export const metadata = {
  title: 'Scratch · Bricks Game · Problocks',
};

// Two-pane experience: Scratch blocks on the left, the 3D bricks (LDraw)
// game on the right. Original full Scratch IDE remains at /studio/scratch.
// Future 2D games can reuse <BlocksGameShell /> with a different gameSrc.
export default function ScratchBricksPage() {
  return (
    <BlocksGameShell
      title="Scratch Bricks"
      gameSrc="/games/lego-game/index.html"
    />
  );
}
