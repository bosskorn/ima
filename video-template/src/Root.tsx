import React from 'react';
import {Composition} from 'remotion';
import {HookStyle, HookProps} from './hook/HookStyle';
import sample from './hook/sample.json';

export const Root = () => (
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
);
