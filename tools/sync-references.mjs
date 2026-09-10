import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';

const bibPath = new URL('../data/survey-references.bib', import.meta.url);
const seedPath = new URL('../data/catalog-seed.json', import.meta.url);
const rolePath = new URL('../data/role-citations.json', import.meta.url);
const outputPath = new URL('../data/references.json', import.meta.url);

function parseBibtex(source) {
  const entries=[];
  let at=0;
  while ((at=source.indexOf('@',at)) !== -1) {
    const typeEnd=source.indexOf('{',at);
    if(typeEnd<0) break;
    const type=source.slice(at+1,typeEnd).trim().toLowerCase();
    let depth=1, quote=false, slash=false, end=typeEnd+1;
    for(;end<source.length;end++){
      const ch=source[end];
      if(quote&&!slash&&ch==='"') quote=false;
      else if(!slash&&ch==='"') quote=true;
      if(!quote&&ch==='{') depth++;
      if(!quote&&ch==='}'&&--depth===0) break;
      slash=!slash&&ch==='\\';
      if(ch!=='\\') slash=false;
    }
    assert(depth===0,`Unclosed BibTeX entry near byte ${at}`);
    const body=source.slice(typeEnd+1,end);
    let pos=0, key='';
    while(pos<body.length&&body[pos]!==',') key+=body[pos++];
    pos++;
    const fields={};
    while(pos<body.length){
      while(/[\s,]/.test(body[pos]||'')) pos++;
      if(pos>=body.length) break;
      let name='';
      while(pos<body.length&&body[pos]!=='=') name+=body[pos++];
      name=name.trim().toLowerCase();pos++;
      while(/\s/.test(body[pos]||'')) pos++;
      let value='';
      if(body[pos]==='{'){
        let d=1;pos++;
        while(pos<body.length&&d){const ch=body[pos++];if(ch==='{')d++;else if(ch==='}')d--;if(d)value+=ch;}
      }else if(body[pos]==='"'){
        pos++;let escaped=false;
        while(pos<body.length){const ch=body[pos++];if(ch==='"'&&!escaped)break;value+=ch;escaped=!escaped&&ch==='\\';if(ch!=='\\')escaped=false;}
      }else{
        while(pos<body.length&&body[pos]!==',') value+=body[pos++];
      }
      if(name) fields[name]=value.trim();
    }
    entries.push({type,key:key.trim(),fields});
    at=end+1;
  }
  return entries;
}

function cleanTex(value='') {
  return value
    .replace(/\\&/g,'&').replace(/\\%/g,'%').replace(/\\_/g,'_')
    .replace(/\\i\b/g,'i').replace(/\\j\b/g,'j')
    .replace(/\\text(?:it|bf|tt|sc)\s*\{([^{}]*)\}/g,'$1')
    .replace(/\\(?:url|href)\s*\{([^{}]*)\}/g,'$1')
    .replace(/\\(?:emph|mathrm|mathbf|mathit)\s*\{([^{}]*)\}/g,'$1')
    .replace(/\\['"`^~=.uvHckbdtr]\s*\{?([A-Za-z])\}?/g,'$1')
    .replace(/\\(?:ss|ae|AE|oe|OE|aa|AA|o|O|l|L)\b/g,'')
    .replace(/\$([^$]+)\$/g,'$1').replace(/[{}]/g,'')
    .replace(/---?/g,'-').replace(/~/g,' ').replace(/\\,/g,' ')
    .replace(/\s+/g,' ').trim();
}
function norm(value=''){return cleanTex(value).toLocaleLowerCase().replace(/[^a-z0-9]+/g,'');}
function arxivId(value=''){return value.match(/(?:arxiv(?:\.org\/(?:abs|pdf)\/|:))([0-9]{4}\.[0-9]{4,5})/i)?.[1]||'';}
function normUrl(value=''){
  if(!value) return '';
  const aid=arxivId(value);if(aid)return `arxiv:${aid}`;
  return value.toLocaleLowerCase().replace(/^https?:\/\/(?:www\.)?/,'').replace(/[?#].*$/,'').replace(/\/$/,'');
}
function monthNumber(value=''){
  const months={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
  const raw=cleanTex(value).toLowerCase();return Number(raw)||months[raw.slice(0,3)]||0;
}
function linkFor(fields){
  if(fields.url) return cleanTex(fields.url);
  if(fields.doi) return `https://doi.org/${cleanTex(fields.doi)}`;
  if(fields.eprint) return `https://arxiv.org/abs/${cleanTex(fields.eprint)}`;
  return '';
}
function venueFor(fields,type){
  const raw=fields.booktitle||fields.journal||fields.howpublished||fields.publisher||fields.institution||fields.school||'';
  if(raw)return cleanTex(raw);
  if(fields.archiveprefix||fields.eprint)return 'arXiv';
  return type==='misc'?'Project or technical resource':'Publication';
}
function shortAuthors(value){
  const names=value.split(/\s+and\s+/i).map(cleanTex).filter(Boolean);
  if(!names.length)return '';
  const surname=name=>name.includes(',')?name.split(',')[0].trim():name.split(/\s+/).at(-1);
  if(names.length===1)return names[0];
  if(names.length===2)return `${surname(names[0])} & ${surname(names[1])}`;
  return `${surname(names[0])} et al.`;
}

const source=await readFile(bibPath,'utf8');
const parsed=parseBibtex(source);
const {papers:seedPapers}=JSON.parse(await readFile(seedPath,'utf8'));
const {roles:roleCitations}=JSON.parse(await readFile(rolePath,'utf8'));
const byTitle=new Map(seedPapers.map(p=>[norm(p.title),p]));
const byUrl=new Map(seedPapers.filter(p=>p.url).map(p=>[normUrl(p.url),p]));
const usedSeed=new Set();
const papers=parsed.map(({type,key,fields})=>{
  const title=cleanTex(fields.title||key);
  const url=linkFor(fields);
  const match=byUrl.get(normUrl(url))||byTitle.get(norm(title));
  if(match)usedSeed.add(match.id);
  const citedRoles=roleCitations[key]||[];
  const primaryRole=match&&citedRoles.includes(match.primaryRole)?match.primaryRole:citedRoles[0]||match?.primaryRole||'context';
  const authorField=fields.author||fields.editor||'';
  const record={
    id:key,title,year:Number(cleanTex(fields.year))||0,month:monthNumber(fields.month),
    authors:cleanTex(authorField),shortAuthors:shortAuthors(authorField),
    primaryRole,roles:citedRoles.length?citedRoles:(match?.primaryRole?[match.primaryRole]:[]),
    topics:match?.topics||[],venue:venueFor(fields,type),url,kind:type,
  };
  if(title==='Diffusion Models Are Real-Time Game Engines')record.aliases=['GameNGen'];
  return record;
});
assert(parsed.length>=417,'The public bibliography unexpectedly lost records');
assert.equal(new Set(papers.map(p=>p.id)).size,papers.length,'Duplicate citation keys');
const unmatchedSeed=seedPapers.filter(p=>!usedSeed.has(p.id));
await writeFile(outputPath,JSON.stringify({schemaVersion:'2.0',source:'Survey bibliography',papers},null,2)+'\n');
const roleCounts=Object.fromEntries(['play','model','design','build','runtime','test','context'].map(role=>[role,papers.filter(p=>p.primaryRole===role).length]));
console.log(`Wrote ${papers.length} references. Reused metadata for ${usedSeed.size} records; ${unmatchedSeed.length} seed-only records remain outside the bibliography.`,roleCounts);
