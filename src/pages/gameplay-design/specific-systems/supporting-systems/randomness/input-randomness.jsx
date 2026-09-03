import React from 'react';
import { Breadcrumb, H1, H2, LI, P, UL } from '@/components/ui.jsx';

export default function Page({ go }) {
  return (
    <div>
      <Breadcrumb auto go={go} />
      <H1>Input Randomness</H1>
      <P>Input randomness changes the situation before the player makes a decision, requiring adaptation instead of a fixed solution.</P>
      <H2 id="examples">Examples</H2>
      <UL>
        <LI><strong>Map seeds variety</strong>          <UL>
            <LI><strong>Space</strong></LI>
            <LI><strong>Enemies</strong></LI>
            <LI><strong>Resource distribution</strong></LI>
          </UL></LI>
      </UL>
      <UL>
        <LI><strong>Random events</strong></LI>
        <LI><strong>Objectives</strong>          <UL>
            <LI>personal quests</LI>
            <LI>optional quests</LI>
          </UL></LI>
      </UL>
    </div>
  );
}