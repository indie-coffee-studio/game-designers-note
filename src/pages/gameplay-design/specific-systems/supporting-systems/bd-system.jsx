import React from 'react';
import { Blockquote, Breadcrumb, H1, H2, LI, P, UL } from '@/components/ui.jsx';

export default function Page({ go }) {
  return (
    <div>
      <Breadcrumb auto go={go} />
      <H1>BD System</H1>
      <H2 id="encourage-build-experimentation">Encourage BD Experimentation</H2>
      <P>When progression is meant to encourage players to change builds and try different abilities, experimentation should create lasting value rather than force players to weaken a working build.</P>
      <Blockquote>
        <UL>
          <LI color="green"><strong>Expedition 33</strong> lets runes keep working even when they are not equipped, so changing builds does not mean becoming weaker.</LI>
          <LI color="red"><strong>Mortal Shell II</strong> requires Tarstones to be equipped to gain experience. To upgrade a level-three stone, players first need to train its weaker level-two version, which means removing a stone that is already supporting the current build.</LI>
        </UL>
      </Blockquote>
    </div>
  );
}