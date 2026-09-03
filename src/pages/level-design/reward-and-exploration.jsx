import React from 'react';
import { Breadcrumb, H1, H2, InternalLink, P } from '@/components/ui.jsx';

export default function Page({ go }) {
  return (
    <div>
      <Breadcrumb auto go={go} />
      <H1>Reward &amp; Exploration</H1>
      <H2 id="rewards"><InternalLink id="rewards" go={go}>Rewards</InternalLink></H2>
      <P>What can be a reward?</P>
      <H2 id="collectibles"><InternalLink id="how-to-display-rewards" go={go}>Collectibles</InternalLink></H2>
      <P>How to use collectibles.</P>
      <H2 id="lock-and-key"><InternalLink id="lock-and-key" go={go}>Lock &amp; Key</InternalLink></H2>
      <P>Exploration itself as a reward.</P>
    </div>
  );
}
