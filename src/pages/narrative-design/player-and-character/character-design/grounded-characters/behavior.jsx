import React from 'react';
import { Blockquote, Breadcrumb, H1, H2, P } from '@/components/ui.jsx';

export default function Page({ go }) {
  return (
    <div>
      <Breadcrumb auto go={go} />
      <H1>Behavior</H1>
      <H2 id="protagonist-growth">Training</H2>
      <H2 id="protagonist-growth"> </H2>
      <P>A protagonist's competence feels more meaningful when it is shown as something learned and trained, rather than simply presented as an innate ability.</P>
      <Blockquote>In <em>007 First Light</em>, players watch the protagonist progress from inexperience to mastery. Through montage, the game turns the training itself into part of the tutorial. Players learn what the protagonist can do while simultaneously experiencing how he acquired those skills. </Blockquote>
    </div>
  );
}
