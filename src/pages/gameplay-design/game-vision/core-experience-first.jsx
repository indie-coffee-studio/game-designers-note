import React from 'react';
import { Breadcrumb, H1, H2, P } from '@/components/ui.jsx';

export default function Page({ go }) {
  return (
    <div>
      <Breadcrumb auto go={go} />
      <H1>Core Experience First</H1>
      <H2 id="design-from-the-core-downward">Design from the Core Downward</H2>
      <P>Start with the core experience and design downward. Keep the original intent of the experience in view when making later decisions, and do not let downstream problems redefine the upstream design.</P>
      <H2 id="protect-the-experience">Protect the Experience</H2>
      <P>When a downstream system creates a problem, solve it within the system or revise the implementation rather than compromising the experience the game was meant to deliver.</P>
      <H2 id="one-peak-experience">One Peak Experience</H2>
      <P>Small games especially benefit from concentrating on one peak experience and making the rest of the design support it.</P>
    </div>
  );
}