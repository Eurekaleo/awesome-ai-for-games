import assert from 'node:assert/strict';
import path from 'node:path';
import {readFile, writeFile} from 'node:fs/promises';

const sectionsDir=process.argv[2];
assert(sectionsDir,'Usage: node tools/extract-role-map.mjs /absolute/path/to/sections');
const roleFiles={
  play:'03_play_and_act.tex',
  model:'04_model_games_and_players.tex',
  design:'05_design_games.tex',
  build:'06_build_and_maintain.tex',
  runtime:'07_runtime_generation_and_adaptation.tex',
  test:'08_test_and_evaluate.tex',
};
const records={};
const addRole=(key,role)=>{
  records[key]??=[];
  if(!records[key].includes(role))records[key].push(role);
};
for(const [role,file] of Object.entries(roleFiles)){
  const source=await readFile(path.join(sectionsDir,file),'utf8');
  for(const match of source.matchAll(/\\cite[a-zA-Z*]*(?:\[[^\]]*\])*\{([^}]+)\}/g)){
    for(const key of match[1].split(',').map(value=>value.trim()).filter(Boolean)){
      addRole(key,role);
    }
  }
}
// Appendix system tables expose secondary roles that a single chapter citation
// cannot express. Import only role badges attached to a system row; do not infer
// a role from the presence of a paper in an evaluation table or bibliography.
const roleByBadge={P:'play',M:'model',D:'design',B:'build',R:'runtime',T:'test'};
const tablePrimary={};
const primaryConflicts=[];
// Play2Code is indexed as a Build system and again as a Test component.
// The paper-level primary role follows the complete system row; the latter
// contributes a secondary role, not a contradictory paper classification.
const componentPrimaryExceptions=new Set(['huang2026guigames']);
const tableFiles=[
  'agent_systems.tex','world_model_systems.tex','design_build_systems.tex',
  'runtime_systems.tex','testing_systems.tex','player_model_systems.tex',
];
for(const file of tableFiles){
  const source=await readFile(path.join(sectionsDir,'..','tables',file),'utf8');
  const lines=source.split('\n');
  for(let i=0;i<lines.length-1;i++){
    const citation=lines[i].match(/\\cite[a-zA-Z*]*\{([^}]+)\}/);
    if(!citation)continue;
    const roleCell=lines[i+1].split('&')[1]||'';
    const roles=[...roleCell.matchAll(/\\indexrole\{([PMDBRT])\}/g)]
      .map(match=>roleByBadge[match[1]]);
    for(const key of citation[1].split(',').map(value=>value.trim()).filter(Boolean)){
      for(const role of roles)addRole(key,role);
      if(roles.length){
        if(tablePrimary[key]&&tablePrimary[key]!==roles[0]&&!componentPrimaryExceptions.has(key))primaryConflicts.push(`${key}: ${tablePrimary[key]} vs ${roles[0]} (${file})`);
        tablePrimary[key]??=roles[0];
      }
    }
  }
}
assert.deepEqual(primaryConflicts,[],`Conflicting manuscript primary roles: ${primaryConflicts.join('; ')}`);
await writeFile(new URL('../data/role-citations.json',import.meta.url),JSON.stringify({schemaVersion:'1.1',roles:records,primary:tablePrimary},null,2)+'\n');
console.log(`Mapped ${Object.keys(records).length} citation keys to one or more survey roles.`);
