import {it,expect} from 'vitest';
import {defaultParameters,getLab} from './definitions';
import {evaluateLab} from './models';
import {pistonGeometry,PIPE_ROTATION_Z} from './sceneGeometry';
it('maps volume linearly and uses the same piston height for S16 and fallback',()=>{
  const definition=getLab('ideal-gas'),p=defaultParameters('ideal-gas'),a=pistonGeometry(definition,p,evaluateLab('ideal-gas',p));
  const half={...p,volume:p.volume/2},b=pistonGeometry(definition,half,evaluateLab('ideal-gas',half));
  expect(a.height/b.height).toBeCloseTo(2,12);expect(a.pistonY).not.toBe(b.pistonY);
  for(const shape of [a,b]){expect(shape.assetOffsetY+shape.assetScale*shape.assetTranslation).toBeCloseTo(shape.pistonY,12);expect(shape.useS16).toBe(true);}
  const large={...p,volume:.01},c=pistonGeometry(definition,large,evaluateLab('ideal-gas',large));
  expect(c.height/a.height).toBeCloseTo(large.volume/p.volume,12);expect(c.useS16).toBe(false);
});
it('keeps the first pipe section on the left of the same duct used for arrows',()=>{
  expect(-Math.sin(PIPE_ROTATION_Z)*-1.5).toBeCloseTo(-1.5,12);
});
