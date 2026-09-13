import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/storage/redis-repository.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022}}).outputText;
const {createRedisRepository} = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));

// Protocol fixture, independent of the repository. Two clients share only this
// HTTP server, matching separate serverless instances rather than module memory.
test('shared storage preserves evidence, concurrent fields, arrays, and provider failures', async () => {
  const hashes = new Map(), sets = new Map(); let fail = false;
  const server = http.createServer(async (req,res) => {
    if (fail) {res.writeHead(503).end();return;}
    assert.equal(req.headers.authorization, 'Bearer test-only');
    let body=''; for await (const chunk of req) body+=chunk;
    const [cmd,key,...args]=JSON.parse(body); const hash=hashes.get(key) || new Map(); let result=null;
    if(cmd==='HSET'||cmd==='HSETNX') {
      result=0;
      for(let i=0;i<args.length;i+=2){if(cmd==='HSETNX'&&hash.has(args[i]))continue;if(!hash.has(args[i]))result++;hash.set(args[i],args[i+1]);}
      hashes.set(key,hash);
    } else if(cmd==='HGET') result=hash.get(args[0])??null;
    else if(cmd==='HVALS') result=[...hash.values()];
    else if(cmd==='HGETALL') result=[...hash.entries()].flat();
    else if(cmd==='EXISTS') result=hashes.has(key)?1:0;
    else if(cmd==='SADD'){const set=sets.get(key)||new Set();args.forEach(v=>set.add(v));sets.set(key,set);result=1;}
    else if(cmd==='SMEMBERS') result=[...(sets.get(key)||[])];
    else {res.writeHead(400).end(JSON.stringify({error:'unsupported'}));return;}
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify({result}));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try {
    const url=`http://127.0.0.1:${server.address().port}`;
    const seeds={project:{id:'campus-events'},journey:{id:'event-registration',projectId:'campus-events'},budget:{projectId:'campus-events'}};
    const a=createRedisRepository(url,'test-only',seeds), b=createRedisRepository(url,'test-only',seeds);
    await Promise.all(Array.from({length:12},(_,i)=>a.saveRun({id:`run-${i}`,projectId:'campus-events',journeyId:'event-registration',timestamp:'2026-09-13',totalBytes:i})));
    assert.equal((await b.listRuns('campus-events')).length,12);
    await assert.rejects(()=>b.saveRun({id:'run-0',totalBytes:999}),/immutable/);
    assert.equal((await a.getRun('run-0')).totalBytes,0);
    await a.saveExperiment({id:'experiment',projectId:'campus-events',baselineRunIds:['run-0'],candidateRunIds:[],reviewerDecision:'pending'});
    assert.deepEqual((await b.getExperiment('experiment')).candidateRunIds,[]);
    await Promise.all([a.updateExperiment('experiment',{reviewerDecision:'approved'}),b.updateExperiment('experiment',{candidateRunIds:['run-1']})]);
    const record=await a.getExperiment('experiment');
    assert.equal(record.reviewerDecision,'approved');assert.deepEqual(record.candidateRunIds,['run-1']);
    assert.equal((await b.listExperiments('campus-events')).length,1);
    assert.equal(await b.updateExperiment('missing',{status:'verified'}),null);
    fail=true; await assert.rejects(()=>b.getExperiment('experiment'),/503/);
  } finally {await new Promise(resolve=>server.close(resolve));}
});
