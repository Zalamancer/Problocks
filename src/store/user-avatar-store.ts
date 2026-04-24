/**
 * The student's active avatar outfit — shared across the wardrobe and
 * the 3D freeform studio. Persisted to localStorage so refreshing the
 * page keeps the student's chosen look.
 *
 * Wardrobe writes via `setOutfit`; the freeform character prefab reads
 * it when spawning and whenever the outfit changes so the scene's
 * character mirrors whatever is on the profile card.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AvatarOutfit } from '@/components/student/RobloxAvatar';

const BOY_DEFAULT: Required<AvatarOutfit> = {
  skin: '#c9a173',
  shirt: '#6fbf73',
  pants: '#3a3c4a',
  face: 'smile',
  hat: 'none',
  hatColor: '#c24949',
  hair: 'short',
  hairColor: '#3a2a1a',
  gender: 'boy',
};

interface UserAvatarStore {
  outfit: Required<AvatarOutfit>;
  setOutfit: (patch: AvatarOutfit) => void;
  resetOutfit: () => void;
}

export const useUserAvatar = create<UserAvatarStore>()(
  persist(
    (set) => ({
      outfit: BOY_DEFAULT,
      setOutfit: (patch) => set((s) => ({ outfit: { ...s.outfit, ...patch } })),
      resetOutfit: () => set({ outfit: BOY_DEFAULT }),
    }),
    { name: 'problocks-user-avatar-v1' },
  ),
);

export const USER_AVATAR_DEFAULT = BOY_DEFAULT;
