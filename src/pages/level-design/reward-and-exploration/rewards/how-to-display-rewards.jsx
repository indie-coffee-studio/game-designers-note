import React from 'react';
import { Blockquote, Breadcrumb, Callout, ExtLink, H1, H2, H3, P } from '@/components/ui.jsx';

export default function Page({ go }) {
  return (
    <div>
      <Breadcrumb auto go={go} />
      <H1>How to display rewards</H1>
      <H2 id="consistency-of-cues">Unwritten rules</H2>
      <Blockquote>
        <P>DKC2: bananas are always helpful; if bananas are above a pit, jumping in won't kill you; DKC1 didn't follow this rule</P>
        <H3>Consistency of cues matters</H3>
      </Blockquote>
      <H2>As motivation </H2>
      <P>Show the reward first and let it motivate players to search for a path.</P>
      <Callout type="tip">Highly visible rewards can interrupt the player's focus, so place them during exploration, between fights, or in low-pressure parts of a quest rather than before a story climax or boss fight.</Callout>
      <H2>As an endpoint</H2>
      <P>Reveal a hidden space or side path first, then use the possibility of a reward to invite players to search for the route; on the contrary, if players reach a dead end and find nothing, they may doubt if there is more ahead. BG3's survival check chest is a fair approach to show that its just a dead end.</P>
      <Callout type="tip">Repeatedly rewarding hidden-space exploration builds trust in the rule that exploration pays off. This approach works well for ordinary hidden rewards.</Callout>
      <H2 id="conditional-triggers">Conditional Triggers</H2>
      <P>Secrets can require a specific condition or action before they appear, such as striking an apparently empty spot to reveal a block or performing a particular action near a statue.</P>
      <Blockquote>Without readable clues, exploration degenerates into meaningless enumeration, players will test every wall, statue, and corner.</Blockquote>
      <H2 id="disguise-and-misdirection">Disguise and Misdirection</H2>
      <P>A secret can already exist in the scene while being disguised as an ordinary part of the environment. </P>
      <H2 id="anti-intuitive">Anti-intuitive</H2>
      <Blockquote>Anti-intuitive example: most DK coins hidden in the level but one is hidden in a bonus room where players are not expecting secrets</Blockquote>
      <P><ExtLink href="https://www.sirlin.net/articles/the-secrets-of-donkey-kong-country-2">The Secrets of Donkey Kong Country 2.pdf</ExtLink></P>
      <Callout type="tip">Achievements and collectibles are not inherently fun, but the process of discovering them can be.</Callout>
    </div>
  );
}