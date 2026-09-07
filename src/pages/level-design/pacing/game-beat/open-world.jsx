import React from 'react';
import { Blockquote, Breadcrumb, H1, H2, LI, P, UL } from '@/components/ui.jsx';

export default function Page({ go }) {
  return (
    <div>
      <Breadcrumb auto go={go} />
      <H1>Open world</H1>
      <H2 id="soft-guiding">Soft-guiding</H2>
      <P>Without guidance, players can easily fall into repeating the same actions for long periods, and repetition can make the experience feel dull.</P>
      <UL>
        <LI>Limit visible interest points</LI>
      </UL>
      <Blockquote>- Visual occlusion — mountains</Blockquote>
      <Blockquote>- Vertical layering design</Blockquote>
      <Blockquote>- Restrict entry/exit points</Blockquote>
      <Blockquote>- Reveals several small POIs after reaching a strong POI</Blockquote>
      <UL>
        <LI>Predict player movement</LI>
      </UL>
      <Blockquote>E.g. Breath of the Wild: approach village → activate shrine → ...</Blockquote>
      <H2 id="checklist-open-world">Checklist Open World</H2>
      <P>If the core gameplay is strong enough, a checklist-driven open world becomes an efficient format that allows players to explore the gameplay in their own pacing.</P>
      <Blockquote>E.g. Racing games, Rise of the Rōnin — the checklist structure works when combat itself is the reward</Blockquote>
      <H2 id="extraction-map-pacing">Extraction Map Pacing</H2>
      <P>Extraction maps suffer most when every part of the rhythm is flat: rewards feel equally valuable, combat has the same intensity everywhere, and routes offer no meaningful variation. Without peaks and valleys, players quickly become bored.</P>
    </div>
  );
}
