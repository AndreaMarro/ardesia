// @vitest-environment jsdom
import {afterEach,expect,test} from 'vitest';
import {cleanup,render,screen} from '@testing-library/react';
import {StudyModel} from './StudyModel';
afterEach(cleanup);
test('the spring graph shows the supplied Core point inside its visible bounds',()=>{
 render(<StudyModel simulation={{activityId:'hooke-v1',parameters:{force:8,stiffness:20},controls:{force:[8],stiffness:[20]},result:{value:.4,unit:'m',domain:'Molla ideale',elasticEnergyJ:1.6}}}/>);
 const graph=screen.getByTestId('spring-graph');const point=graph.querySelector('circle');
 expect(point).not.toBeNull();expect(point?.textContent).toContain('0,4 m: 8 N');
 expect(Number(point?.getAttribute('cx'))).toBeGreaterThanOrEqual(70);expect(Number(point?.getAttribute('cx'))).toBeLessThanOrEqual(445);
 expect(Number(point?.getAttribute('cy'))).toBeGreaterThanOrEqual(30);expect(Number(point?.getAttribute('cy'))).toBeLessThanOrEqual(215);
});
