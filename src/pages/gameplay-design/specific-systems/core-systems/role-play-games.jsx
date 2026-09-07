import React from 'react';
import { Blockquote, Breadcrumb, Callout, H1, H2, P } from '@/components/ui.jsx';

export default function Page({ go }) {
  return (
    <div>
      <Breadcrumb auto go={go} />
      <H1>Role Play Games</H1>
      <Callout type="tip">Give role play choices meaningful consequences.</Callout>
      <H2>Narrative Consequences</H2>
      <H2>Pressure System</H2>
      <P>Binding Player Stakes to Character Stakes</P>
      <Blockquote>
        <P>In <em>ZERO PARADES: For Dead Spies</em>, activating a thought affects not only mechanics, but also how the player is expected to act. Players must consider both its benefits and whether they are willing to perform as that kind of character.</P>
        <P>A character’s danger may feel distant, but when saying the wrong thing can cost the player levels or stats, that pressure becomes personal. </P>
      </Blockquote>
    </div>
  );
}
