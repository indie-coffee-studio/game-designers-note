import React from 'react';
import { Breadcrumb, H1, H2, InternalLink, P } from '@/components/ui.jsx';

export default function Page({ go }) {
  return (
    <div>
      <Breadcrumb auto go={go} />
      <H1>Game Vision</H1>
      <P>What is your game, why would anyone play it, and how do the systems all fit together</P>      <H2 id="core-experience-first"><InternalLink id="core-experience-first" go={go}>Core Experience First</InternalLink></H2>
      <P>Start from the core experience and design downward.</P>
      <H2 id="game-loop"><InternalLink id="game-loop" go={go}>Game Loop</InternalLink></H2>
      <P>What do players do repeatedly, and why does it stay engaging?</P>
      <H2 id="checklist"><InternalLink id="checklist" go={go}>Checklist</InternalLink></H2>
      <P>Check if your vision is clear.</P>
    </div>
  );
}
