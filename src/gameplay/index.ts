// Local reusable entry point. Phaser/DOM adapters remain explicit; this is not a published SDK.
export * from './locomotion';
export {bindAnalogStick} from './analog-stick';
export {prepareSofia,SOFIA_HEIGHT,SOFIA_SCALE} from '../sofia';
export {preloadSofiaActions,prepareSofiaActions,animateActor} from './sofia-actions';
export {stepBody,surfacePoint,angleDiff} from '../planet-model';
export {mechanicsFor,lampState,commandLamp} from './equipment';
export {attachHeldLamp,preloadHeldLamp} from './phaser/held-tool';
export {RoomLight} from './phaser/room-light';
export {meets,type Conditions} from './conditions';
export * from './projectiles';
export {canWalkPath} from './side-path';
export {hitZone,canvasPoint} from './hit-test';

export * from './combat';
