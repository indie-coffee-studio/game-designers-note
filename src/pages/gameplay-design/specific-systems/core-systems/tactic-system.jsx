import React from 'react';
import { Blockquote, Breadcrumb, Callout, H1, H2, LI, P, UL } from '@/components/ui.jsx';

export default function Page({ go }) {
  return (
    <div>
      <Breadcrumb auto go={go} />
      <H1>Tactic System</H1>
      <H2 id="prioritize-tactics">Prioritize Tactics</H2>
      <Blockquote>Shadow Tactics and Desperados are still called RTT, but the adding of pause decrease the reaction demand so players can focus more decision-making. Personally, it's a right trade.</Blockquote>
      <H2 id="role-differentiation">Role Differentiation Creates Strategy</H2>
      <P>In a tactics game, differentiating the roles of units is not just variety; it provides the strategic options the game depends on.</P>
      <P>If killing enemies is the only objective, play quickly becomes one-dimensional. Multiple roles and objectives give players reasons to make different plans.</P>
      <UL>
        <LI>Protect an allied unit or vulnerable objective.</LI>
        <LI>Capture and hold a tactically valuable position.</LI>
        <LI>Break through to the opponent's backline.</LI>
      </UL>
      <H2 id="threats-create-movement">Threats Should Create Reasons to Move</H2>
      <P>From a threat-management perspective, threats should not fundamentally restrict movement. They should give players a reason to actively move toward a particular position.</P>
      <P>Positioning becomes strategic when the player must decide which threat to answer, where to answer it, and what opportunity is created by committing to that location.</P>
      <H2 id="durable-mechanisms">Discover Durable Mechanisms</H2>
      <Callout type="info">When exploring outside the expected path, designers can recognize why certain mechanisms remain effective across many games. </Callout>
    </div>
  );
}