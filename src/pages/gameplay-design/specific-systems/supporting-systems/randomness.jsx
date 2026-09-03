import React from 'react';
import { Breadcrumb, H1, H2, InternalLink, P } from '@/components/ui.jsx';

export default function Page({ go }) {
  return (
    <div>
      <Breadcrumb auto go={go} />
      <H1>Randomness</H1>
      <H2 id="input-randomness"><InternalLink id="input-randomness" go={go}>Input Randomness</InternalLink></H2>
      <P>Randomness that changes the situation before the player makes a decision.</P>
      <H2 id="output-randomness"><InternalLink id="output-randomness" go={go}>Output Randomness</InternalLink></H2>
      <P>Randomness that determines the result after the player has chosen an action.</P>
    </div>
  );
}