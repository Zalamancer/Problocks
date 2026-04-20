// Cardboard avatar HEAD tile for teacher views. Used wherever the old
// `s.emoji` square was rendered as a profile photo (StudentsList card,
// StudentDetail header, StudentSelf header). Small roster chips in
// Overview / Assignments / charts inline <CardboardHead> directly.
//
// The rendering pipeline (shared WebGL renderer + PNG cache) lives in
// CardboardHead.tsx — this file is just the Student→AvatarOutfit shim.
'use client';

import React from 'react';
import { CardboardHead } from './CardboardHead';
import type { Student } from './sample-data';

export const StudentAvatar = ({
  s, px, framed = true,
}: {
  s: Student;
  /** Square pixel size for the tile. */
  px: number;
  /** Butter-yellow chunky frame (hero tiles). */
  framed?: boolean;
}) => <CardboardHead outfit={s.avatar} px={px} framed={framed}/>;
