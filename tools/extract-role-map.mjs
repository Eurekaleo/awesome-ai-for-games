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
for(const [role,file] of Object.entries(roleFiles)){
  const source=await readFile(path.join(sectionsDir,file),'utf8');
  for(const match of source.matchAll(/\\cite[a-zA-Z*]*(?:\[[^\]]*\])*\{([^}]+)\}/g)){
    for(const key of match[1].split(',').map(value=>value.trim()).filter(Boolean)){
      records[key]??=[];
      if(!records[key].includes(role))records[key].push(role);
    }
  }
}
await writeFile(new URL('../data/role-citations.json',import.meta.url),JSON.stringify({schemaVersion:'1.0',roles:records},null,2)+'\n');
console.log(`Mapped ${Object.keys(records).length} citation keys to one or more survey roles.`);
