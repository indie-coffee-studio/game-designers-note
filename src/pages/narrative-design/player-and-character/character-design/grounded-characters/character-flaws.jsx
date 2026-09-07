import React from 'react';
import { Blockquote, Breadcrumb, H1, H2, P } from '@/components/ui.jsx';

export default function Page({ go }) {
  return (
    <div>
      <Breadcrumb auto go={go} />
      <H1>Character Flaws</H1>
      <H2 id="externalize-flaws">Call Out the Flaws</H2>
      <P>Flaws becomes much easier to tolerate when the people around them call them out. If a character is annoying, the audience will naturally find them annoying too. But if the other characters in the story also point out what makes that character annoying, the audience will feel seen and won’t feel like the story is indulging them.</P>
      <Blockquote><em>Bond’s smugness is always kept in check by someone around him in </em>007 First Light.</Blockquote>
    </div>
  );
}
