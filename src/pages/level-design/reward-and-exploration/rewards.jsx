import React from 'react';
import { Blockquote, Breadcrumb, CrossLink, H1, H2, InternalLink, LI, UL } from '@/components/ui.jsx';

export default function Page({ go }) {
  return (
    <div>
      <Breadcrumb auto go={go} />
      <H1>Rewards</H1>
      <H2 id="reward-expectation">Reward Expectation</H2>
      <Blockquote>Mismatch between expectation and reward reduces motivation to explore. E.g. mushrooms in Elden Ring</Blockquote>
      <H2 id="rewards-as-a-hint">Rewards as a hint</H2>
      <Blockquote>Small coin -&gt; big coin -&gt; hidden path</Blockquote>
      <H2 id="reward-types">Reward types</H2>
      <Blockquote>
        <UL>
          <LI>Collectibles </LI>
          <LI>Resources</LI>
          <LI>Clues (notes, treasure maps)</LI>
        </UL>
      </Blockquote>
      <H2 id="dont-let-finding-rewards-be-a-task"><CrossLink pageId="rewarding-exploration" anchor="dont-let-finding-rewards-be-a-task" go={go}>Don't let finding rewards be a task</CrossLink></H2>
      <Blockquote>Korok mask, helps you know where has a collectible, which is great. But showing the total collectibles of 1000 Koroks doesn't motivate players at all.</Blockquote>
      <H2><InternalLink id="how-to-display-rewards" go={go}>How to Display Rewards</InternalLink></H2>
    </div>
  );
}