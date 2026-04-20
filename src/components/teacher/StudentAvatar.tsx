// Cardboard RobloxAvatar tile, used in the teacher dashboard wherever the
// old emoji "profile photo" square lived (StudentsList card, StudentDetail
// header, StudentSelf header). autoRotate is OFF by default so a roster of
// 12 simultaneous WebGL canvases doesn't burn CPU on Celeron Chromebooks
// (target hardware constraint). Call sites can opt back in via `spinning`.
'use client';

import React from 'react';
import { RobloxAvatar } from '@/components/student/RobloxAvatar';
import type { Student } from './sample-data';

export const StudentAvatar = ({
  s, px, framed = true, spinning = false,
}: {
  s: Student;
  /** Square pixel size for the tile. */
  px: number;
  /** Chunky butter-yellow frame (matches the wardrobe preview card). */
  framed?: boolean;
  /** Auto-orbit the cardboard character. Off in dense lists. */
  spinning?: boolean;
}) => (
  <div style={{ width: px, height: px, flexShrink: 0 }}>
    <RobloxAvatar
      size="fill"
      framed={framed}
      autoRotate={spinning}
      outfit={s.avatar}
    />
  </div>
);
