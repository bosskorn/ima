import React from 'react';
import {Composition} from 'remotion';
import {HookStyle, HookProps} from './hook/HookStyle';
import sample from './hook/sample.json';
import {CartoonScene} from './cartoon/Scene';

export const Root = () => (
  <>
  <Composition id="Cartoon" component={CartoonScene} durationInFrames={150} fps={30} width={1080} height={1920} />
  <Composition
    id="Hook"
    component={HookStyle}
    durationInFrames={240}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={sample as HookProps}
    calculateMetadata={async ({props}) => ({
      durationInFrames: Math.ceil(Math.max(props.hookEnd, ...props.captions.map((c) => c.end)) * 30) + 6,
    })}
  />
  </>
);
