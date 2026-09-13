/** Builds the application adapter from verified, unmodified ThreeUI Community source. */
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const root = process.cwd();
const assets = join(root, 'node_modules/@designcodeio/threeui/lib-dist/assets/landing-pages');
const source = await readFile(join(assets, 'inner-green-3d.html'), 'utf8');
const sha = createHash('sha256').update(source).digest('hex');
if (sha !== '69c3694bd63f44ef9f007ebe4dac57a83e4402e0cdf6b54dd10b96dd4f05e197') {
  throw new Error('Sylva source differs from the catalog revision SHA-256 05f359ce157a.');
}
const target = join(root, 'public/landing-pages');
await mkdir(join(target, 'inner-green-assets'), { recursive: true });
for (const file of ['three.min.js', 'lexend-latin.woff2', 'card-ethos.jpg', 'card-ecostove.jpg']) {
  await copyFile(join(assets, 'inner-green-assets', file), join(target, 'inner-green-assets', file));
}
await copyFile(join(assets, 'inner-green-3d.html'), join(target, 'inner-green-3d.html'));
await copyFile(join(root, 'node_modules/@designcodeio/threeui/LICENSE'), join(target, 'LICENSE.txt'));
await copyFile(join(root, 'node_modules/@designcodeio/threeui/FONT-LICENSES.md'), join(target, 'FONT-LICENSES.md'));

// The public SylvaLivingWorldScene adapter uses the same two authored boundaries.
const start = source.indexOf('<main class="hero" id="hero">');
const end = source.indexOf('<script src="inner-green-assets/three.min.js"></script>');
if (start < 0 || end <= start) throw new Error('Authored Sylva boundaries changed.');
let html = source.slice(0, start) + '<main class="hero" id="hero"><canvas id="scene" aria-hidden="true"></canvas><div class="stage" id="stage" aria-hidden="true"></div></main>\n' + source.slice(end);
const replace = (from, to) => {
  if (!html.includes(from)) throw new Error('Sylva adapter target missing: ' + from.slice(0, 70));
  html = html.replace(from, to);
};
replace('</head>', `<base href="/landing-pages/">
<style data-carbonterra-world>
html,body{width:100%!important;height:100%!important;min-height:0!important;margin:0!important;overflow:hidden!important;background:#4a4d44!important}
.hero{height:100%!important;min-height:0!important}#scene{pointer-events:none!important}
@media(max-width:900px){.stage{position:absolute!important;left:50%!important;top:50%!important;width:calc(760 * var(--u))!important;height:calc(1625 * var(--u))!important;margin-left:calc(-380 * var(--u))!important;margin-top:calc(-812.5 * var(--u))!important;padding:0!important}}
</style></head>`);
replace("  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;", `  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WORLD_ORIGIN = window.parent.location.origin;
  var worldActive = !REDUCED, worldFrame = 0, worldLast = 0;
  var worldTarget = {x:0,y:0,zoom:1,turn:0}, worldPose = {x:0,y:0,zoom:1,turn:0};
  function setWorldActive(value) {
    worldActive = value && !document.hidden;
    REDUCED = !worldActive;
    if (!worldActive) { cancelAnimationFrame(worldFrame); worldFrame = 0; if (renderer && clock) {scanning=false;uScanOn.value=0;uWire.value=0;tick();} }
    else if (!worldFrame) { worldLast=0; worldFrame=requestAnimationFrame(worldLoop); }
  }
  function worldLoop(now) {
    if (!worldActive) {worldFrame=0;return;}
    worldFrame=requestAnimationFrame(worldLoop);
    if (now-worldLast < (innerWidth<900 ? 1000/24 : 1000/30)) return;
    worldLast=now; tick();
  }
  window.addEventListener('message', function(event) {
    if(event.source!==window.parent || event.origin!==WORLD_ORIGIN || !event.data || event.data.type!=='carbonterra:world') return;
    var data=event.data;
    if(data.pose) ['x','y','zoom','turn'].forEach(function(key){
      if(Number.isFinite(data.pose[key])) worldTarget[key]=Math.max(key==='zoom'?.65:-2,Math.min(key==='zoom'?1.7:2,data.pose[key]));
    });
    if(typeof data.active==='boolean') setWorldActive(data.active);
    if(data.pointer && worldActive) {pointer.x=data.pointer.x;pointer.y=data.pointer.y;ndc.x=pointer.x;ndc.y=-pointer.y;}
    if(data.scan && worldActive && renderer) {scanning=true;scanT=0;uScanOn.value=1;uScanR.value=0;}
    if(!worldActive && renderer && clock) tick();
  });
  document.addEventListener('visibilitychange',function(){if(document.hidden)setWorldActive(false);});
  window.addEventListener('pagehide',function(){cancelAnimationFrame(worldFrame);if(renderer){renderer.dispose();renderer.forceContextLoss();}});
  window.addEventListener('load',function(){window.parent.postMessage({type:'carbonterra:world-ready'},WORLD_ORIGIN);});`);
replace('(function loop() { requestAnimationFrame(loop); tick(); })();', 'if(worldActive) worldFrame=requestAnimationFrame(worldLoop); else tick();');
replace('renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.6 : 2));', 'renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.2 : 1.6));');
replace('    camera.position.x = -smooth.x * 26;\n    camera.position.y =  smooth.y * 16;\n    camera.lookAt(camera.position.x * 0.42, camera.position.y * 0.42, 0);', `    var blend = REDUCED ? 1 : 1-Math.exp(-dt*2.8);
    ['x','y','zoom','turn'].forEach(function(key){worldPose[key]+=(worldTarget[key]-worldPose[key])*blend;});
    camera.position.x = worldPose.x * W * .34 - smooth.x * 26;
    camera.position.y = worldPose.y * H * .34 + smooth.y * 16;
    camera.position.z = DIST / worldPose.zoom;
    camera.lookAt(camera.position.x * .25, camera.position.y * .2, 0);
    nearGroup.rotation.y = worldPose.turn;
    farGroup.rotation.y = worldPose.turn * .45;`);
replace('nearGroup.rotation.y = smooth.x * 0.055;', 'nearGroup.rotation.y = worldPose.turn + smooth.x * 0.055;');
replace('farGroup.rotation.y  = smooth.x * 0.030;', 'farGroup.rotation.y = worldPose.turn * .45 + smooth.x * .030;');
// A render error leaves the CSS atmosphere and functioning application intact.
replace('catch (err) { console.error(err); }', "catch (err) { console.error(err);parent.postMessage({type:'carbonterra:world-error'},WORLD_ORIGIN); }");
replace('</body>', `<script>window.addEventListener('error',function(){parent.postMessage({type:'carbonterra:world-error'},parent.location.origin);});document.getElementById('scene').addEventListener('webglcontextlost',function(event){event.preventDefault();parent.postMessage({type:'carbonterra:world-error'},parent.location.origin);});</script></body>`);
await writeFile(join(target, 'carbonterra-world.html'), html);
await writeFile(join(target, 'source-manifest.json'), JSON.stringify({
  package:'@designcodeio/threeui', version:'1.2.0', component:'SylvaHero', variant:'living-green',
  catalogRevision:'SHA-256 05f359ce157a', originalHtmlSha256:sha,
  adapterSha256:createHash('sha256').update(html).digest('hex'),
  sourceCatalog:'https://raw.githubusercontent.com/MengTo/threeui/main/public/source-code.json',
  modifications:['Extract authored scene from hero DOM','Parent-controlled camera choreography and scan','Pause, visibility and reduced motion','Bounded DPR and frame rate','Local asset base and recovery notice'],
}, null, 2)+'\n');
console.log('Verified Sylva 05f359ce157a; generated one continuous local world.');
