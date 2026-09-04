import React from 'react';
import { Breadcrumb, H1, H2, P } from '@/components/ui.jsx';

export default function Page({ go }) {
  return (
    <div>
      <Breadcrumb auto go={go} />
      <H1>Progression System</H1>
      <H2 id="character-specific-growth">Character-specific Growth</H2>
      <P>When there are multiple characters, avoid one character gaining all growth while others stagnate.</P>
    </div>
  );
}
