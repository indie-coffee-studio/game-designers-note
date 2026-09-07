import React from 'react';
import { Blockquote, Breadcrumb, H1, H2, InternalLink, P } from '@/components/ui.jsx';

export default function Page({ go }) {
  return (
    <div>
      <Breadcrumb auto go={go} />
      <H1>Enemy</H1>
      <H2 id="enemy-readability">Enemy Readability</H2>
      <P>Players should be able to locate and read enemies quickly.</P>
      <Blockquote>E.g. The Finals: clean, bright visual style keeps enemies readable at a glance</Blockquote>
      <H2 id="hit-reaction">Hit Reaction</H2>
      <P><strong>Hit feedback should not always be maximized.</strong> </P>
      <P>In musou-style games, enemies can be knocked dramatically backward, </P>
      <P>In more action-heavy games, excessive reactions can make enemies behaviors less readable.</P>
      <H2 id="mob"><InternalLink id="mob" go={go}>Mob</InternalLink></H2>
      <P>Standard enemies that shape routine combat</P>
      <H2 id="boss"><InternalLink id="boss" go={go}>Boss</InternalLink></H2>
      <P>Stronger encounters</P>
    </div>
  );
}
