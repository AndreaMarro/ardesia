import {defineManifest} from '../../src/sdk/index';
import {labDefinitions} from './definitions';

/** Existing SDK manifest. Scientific authoring data is a companion descriptor,
 * not an extension to the signed wire format or another plugin registry. */
export const manifest=defineManifest({manifestVersion:1,id:'io.ardesia.fluid-thermo',
  name:'Fluidi e termodinamica · laboratori',version:'1.0.0',protocol:'>=1.0 <2.0',contract:'>=1.3 <2.0',
  kind:'plugin',author:{name:'Ardesia'},license:'LicenseRef-Ardesia-Original',visibility:'private',
  entry:'index.html',surfaces:['board-embed','panel'],
  capabilities:{'board.write':{scope:'own-embeds'},ui:{}},
  // This is a bundled first-party definition, not a signed installable package.
  // Packaging must replace the placeholder with its verified publisher key.
  publisher:{id:'ardesia',pubkey:'ed25519:AAAA'},privacy:{dataOut:'none'}});
export const scientificDefinition={schema:'ardesia.scientific-plugin/1',manifest,
  configurationSchema:'ardesia.fluid-thermo.configuration/1',snapshotSchema:'ardesia.fluid-thermo.snapshot/1',
  modelVersion:1,models:labDefinitions,distribution:'BUNDLED_FIRST_PARTY',
  installablePackage:false,humanScientificApproval:false} as const;
