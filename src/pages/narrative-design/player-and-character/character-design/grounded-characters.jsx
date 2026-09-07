import React from 'react';
import { Blockquote, Breadcrumb, H1, H2, InternalLink, P } from '@/components/ui.jsx';

export default function Page({ go }) {
  return (
    <div>
      <Breadcrumb auto go={go} />
      <H1>Grounded Characters</H1>
      <H2 id="dialogue"><InternalLink id="dialogue" go={go}>Dialogue</InternalLink></H2>
      <P>Dialogue is the most common way to reveal character.</P>
      <H2 id="behavior"><InternalLink id="behavior" go={go}>Behavior</InternalLink></H2>
      <P>Actions, reactions, habits, and growth reveal character.</P>
      <H2 id="character-flaws"><InternalLink id="character-flaws" go={go}>Character Flaws</InternalLink></H2>
      <P>Flaws make characters grounded.</P>
      <H2 id="values">Values</H2>
      <Blockquote>Show what characters care about, protect, reject, or sacrifice</Blockquote>
    </div>
  );
}
