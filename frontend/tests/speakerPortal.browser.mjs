import { spawn } from 'node:child_process';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
if (!process.env.CHROME_PATH) throw new Error('Set CHROME_PATH to a Chromium executable.');
const profile = await mkdtemp(tmpdir() + '/steam-speaker-test-');
const origin='http://127.0.0.1:4178';
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4178','--strictPort'],{cwd:fileURLToPath(new URL('..', import.meta.url))});
await new Promise((resolve,reject)=>{vite.stdout.on('data',d=>{if(d.toString().includes('4178'))resolve()});vite.on('exit',c=>reject(new Error(`Vite exited ${c}`)));});
const chrome = spawn(process.env.CHROME_PATH, ['--no-sandbox', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank']);
let ws;
try {
  const endpoint = await new Promise((resolve, reject) => {
    let output = '';
    chrome.stderr.on('data', chunk => { output += chunk; const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/); if (match) resolve(match[1]); });
    chrome.on('exit', code => reject(new Error(`Chromium exited: ${code}`)));
  });
  ws = new WebSocket(endpoint);
  await new Promise(resolve => ws.addEventListener('open', resolve, {once:true}));
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', event => { const m = JSON.parse(event.data); if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(m.error) : p.resolve(m.result); } });
  const send = (method, params = {}, sessionId) => new Promise((resolve,reject) => { const n = ++id; pending.set(n,{resolve,reject}); ws.send(JSON.stringify({id:n,method,params,sessionId})); });
  const {targetId} = await send('Target.createTarget',{url:'about:blank'});
  const {sessionId} = await send('Target.attachToTarget',{targetId,flatten:true});
  const cdp = (method, params) => send(method,params,sessionId);
  const evaluate = async expression => { const r = await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
  const settle = () => new Promise(resolve => setTimeout(resolve,230));

  const errors=[];
  ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text)});
  await cdp('Runtime.enable');
  const waitFor=async expression=>{for(let n=0;n<60;n++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100))}throw new Error(`Timed out: ${expression}`)};
  const navigate=async path=>{await cdp('Page.navigate',{url:origin+path});await waitFor('document.querySelector("h1") !== null');await settle()};
  const click=async selector=>{
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);
    const p=await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await cdp('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});
    await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});await settle();
  };
  const noOverflow=async()=>assert.equal(await evaluate('document.documentElement.scrollWidth > document.documentElement.clientWidth'),false);

  const key=async(key,code,num)=>{await cdp('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:num,...(key==='Enter'?{text:'\r'}:{})});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:num});await settle()};

  const text = () => evaluate('document.body.innerText');
  const noScheduleActions = async () => {
    assert.equal(await evaluate(`[...document.querySelectorAll('button,a')].some(el => /Request Schedule Change|Add to Calendar/.test(el.textContent))`), false);
    assert.match(await text(), /Date and time to be announced/);
    assert.match(await text(), /Room to be announced/);
    assert.match(await text(), /Calendar downloads require a confirmed start time, end time, and event timezone/);
  };
  for (const width of [320,768,1440]) {
    await cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate('/');
    await noOverflow();
    assert.equal(await evaluate('document.querySelectorAll(".track-card").length'),5);
    await click('nav a[href="/speakers"]');
    assert.equal(await evaluate('location.pathname'), '/speakers');
    assert.equal(await evaluate('document.activeElement.id'), 'directory-main');
    await noOverflow();
    assert.equal(await evaluate('document.querySelectorAll("#directory-heading + fieldset button").length'),6);
    const expectedNames = ['Bill Nye','Neil deGrasse Tyson','Raven Baxter','Fei-Fei Li','Timnit Gebru','Limor Fried','Mark Rober','Ayanna Howard','Mae Jemison','Refik Anadol','Es Devlin','Neri Oxman','Eric Weinstein','Hannah Fry','Marcus du Sautoy'];
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('[id^="speaker-"]')].map(el=>el.textContent)`),expectedNames);
    assert.equal(await evaluate('document.querySelectorAll(".directory-panels article").length'),5);
    assert.equal(await evaluate('document.querySelectorAll(".directory-card a, .directory-card button").length'),0);
    assert.match(await text(), /Proposed placeholder programming for UI development only/);
    for (const [index, count] of [[2,4],[3,4],[4,4],[5,3],[6,3],[1,15]]) {
      await click(`.portal-filters button:nth-of-type(${index})`);
      assert.equal(await evaluate('document.querySelectorAll("[id^=speaker-]").length'),count);
      await noOverflow();
    }
    await evaluate('document.querySelector(".portal-filters button").focus()');
    await key('Tab','Tab',9);
    assert.equal(await evaluate('document.activeElement.textContent'),'Science');
    assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineStyle'),'solid');
    await key('Enter','Enter',13);
    assert.equal(await evaluate('document.activeElement.getAttribute("aria-pressed")'),'true');
    await click('.directory-search input');
    await cdp('Input.insertText',{text:'no matching speaker'});
    await settle();
    assert.match(await text(), /No speakers match these filters/);
    await click('.portal-empty button');
    assert.equal(await evaluate('document.querySelectorAll("[id^=speaker-]").length'),15);
    if (process.env.SCREENSHOT_DIR) {
      const screenshot = await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
      await writeFile(`${process.env.SCREENSHOT_DIR}/directory-${width}.png`, Uint8Array.from(atob(screenshot.data), c => c.charCodeAt(0)));
    }
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('.site-header nav > a')].map(a => [a.textContent, a.getAttribute('href')])`), [
      ['Events', '/#events'], ['Tracks', '/#tracks'], ['Speakers', '/speakers'], ['Travel', '/#travel'],
    ]);
    assert.equal(await evaluate('document.querySelectorAll(".nav-login summary").length'), 1);
    await evaluate('document.querySelector(".nav-login summary").focus()');
    for (const [name, code, number] of [['Enter','Enter',13], [' ','Space',32]]) {
      await key(name,code,number);
      assert.equal(await evaluate('document.querySelector(".nav-login").open'),true);
      await noOverflow();
      assert.equal(await evaluate(`(()=>{const r=document.querySelector('.nav-login ul').getBoundingClientRect();return r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight})()`),true);
      await key('Tab','Tab',9);
      assert.equal(await evaluate('document.activeElement.textContent'),'Attendee Portal');
      assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineStyle'),'solid');
      await key('Escape','Escape',27);
      assert.equal(await evaluate('document.querySelector(".nav-login").open'),false);
      assert.equal(await evaluate('document.activeElement.tagName'),'SUMMARY');
      assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineStyle'),'solid');
    }
    await click('.directory-grid > li:nth-child(2) .directory-card');
    assert.equal(await evaluate('location.pathname'),'/speakers');
    await click('.nav-login summary');
    await click('h1');
    assert.equal(await evaluate('document.querySelector(".nav-login").open'),false);
    // Retain the element to verify selection closes it before route unmount.
    await evaluate('void (window.previousLogin = document.querySelector(".nav-login"))');
    await click('.nav-login summary');
    await click('.nav-login a[href="/attendee"]');
    assert.equal(await evaluate('location.pathname'), '/attendee');
    assert.equal(await evaluate('window.previousLogin.open'),false);
    assert.equal(await evaluate('document.querySelector("#attendee-main") !== null'),true);
    assert.match(await text(), /Your itinerary/);
    await noOverflow();
    for (const [path, heading] of [
      ['/attendee/travel', 'Book your way there and back.'],
      ['/attendee/hotel', 'Find your STEAM Con stay.'],
      ['/attendee/car', 'Reserve your ride.'],
    ]) {
      await click(`a[href="${path}"]`);
      assert.equal(await evaluate('location.pathname'),path);
      assert.equal(await evaluate('document.querySelector("h1").textContent'),heading);
      assert.equal(await evaluate('document.querySelector("main form") !== null'),true);
      await noOverflow();
      await click('a[href="/attendee"]');
      assert.equal(await evaluate('document.querySelector("#attendee-main") !== null'),true);
    }
    await navigate('/');
    assert.equal(await evaluate(`document.querySelector('header a[href="/register"]') !== null`),false);
    await click('main a[href="/register"]');
    assert.equal(await evaluate('location.pathname'),'/register');
    assert.match(await text(), /Choose how you’ll show up/);
    await noOverflow();
    await navigate('/speakers');
    // Open the menu if the shared header was remounted by routing.
    if (!await evaluate('document.querySelector(".nav-login").open')) await click('.nav-login summary');
    await evaluate('void (window.previousLogin = document.querySelector(".nav-login"))');
    await evaluate(`document.querySelector('.nav-login a[href="/speaker"]').focus()`);
    await key('Enter','Enter',13);
    assert.equal(await evaluate('window.previousLogin.open'),false);
    await waitFor('document.querySelectorAll(".portal-proposal").length === 2');
    assert.equal(await evaluate('location.pathname'), '/speaker');
    assert.match(await text(), /Welcome back, Bill/);
    assert.doesNotMatch(await text(), /Preview speaker workspace/);
    assert.equal(await evaluate('document.querySelectorAll("select").length'),0);
    assert.match(await text(), /Bill Nye/);
    assert.match(await text(), /Chief Ambassador and Vice Chairman/);
    assert.match(await text(), /Science Changes Everything/);
    await noOverflow();
    await noScheduleActions();
    assert.match(await text(), /not confirmed as a STEAM Con participant/);
    assert.match(await text(), /former CEO of The Planetary Society from 2010 to 2026/);
    assert.match(await text(), /Location to be announced/);
    assert.equal(await evaluate('document.querySelectorAll(".portal-session").length'),2);
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('.portal-session:last-child .portal-speaker-names li')].map(el => el.textContent)`), ['Bill Nye','Neil deGrasse Tyson','Mae Jemison']);
    assert.equal(await evaluate(`[...document.querySelectorAll('button[aria-disabled="true"]')].length`),2);
    await evaluate('document.querySelector(".portal-filters button").focus()');
    await key('Tab','Tab',9);
    assert.equal(await evaluate('document.activeElement.textContent'),'Science');
    assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineStyle'),'solid');
    await key('Enter','Enter',13);
    assert.equal(await evaluate('document.activeElement.getAttribute("aria-pressed")'),'true');
    await click('.portal-filters button:nth-of-type(4)');
    assert.equal(await evaluate('document.querySelectorAll(".portal-proposal").length'),1);
    await click('.portal-filters button:first-of-type');
    if (process.env.SCREENSHOT_DIR) {
      const screenshot = await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
      await writeFile(`${process.env.SCREENSHOT_DIR}/bill-nye-${width}.png`, Uint8Array.from(atob(screenshot.data), c => c.charCodeAt(0)));
    }
    await click('.portal-proposal .portal-home');
    assert.equal(await evaluate('location.pathname'),'/speaker/proposals/proposal-bill-nye');
    assert.equal(await evaluate('document.activeElement.id'),'proposal-main');
    await noOverflow();
    await noScheduleActions();
    await navigate('/speaker/proposals/proposal-panel-space-imagination');
    await noOverflow();
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('[aria-label="Co-speakers"] h3')].map(el => el.textContent)`), ['Neil deGrasse Tyson','Mae Jemison']);
    await noScheduleActions();
    await navigate('/speaker/proposals/proposal-schedule-test?preview=scheduled');
    await noOverflow();
    assert.match(await text(), /January 1, 2000 at 5:00 AM EST/);
    assert.equal(await evaluate('document.querySelectorAll("a[download]").length'),1);
    await click('.portal-schedule-actions button');
    assert.match(await text(), /No request was sent/);
    for (const scenario of ['empty','error','loading']) {
      await navigate('/speaker?preview=' + scenario);
      await noOverflow();
      assert.match(await text(), scenario === 'empty' ? /Make room for your first idea/ : scenario === 'error' ? /Unable to load proposals/ : /Loading proposals/);
    }
    console.log(`PASS: ${width}px navigation, dashboard, panelists, schedule actions, keyboard focus, and empty/error/loading states`);
  }
  await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await navigate('/');
  assert.equal(await evaluate('matchMedia("(prefers-reduced-motion: reduce)").matches'),true);
  await navigate('/speakers');
  await noOverflow();
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".portal-filters button")).animationName'),'none');
  await navigate('/speaker');
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".portal-propose button")).transform'),'none');
  assert.deepEqual(errors,[]);
  console.log('PASS: reduced motion and no browser runtime errors');
} finally {
  ws?.close();
  chrome.kill();
  vite.kill();
  await new Promise(resolve => chrome.exitCode !== null ? resolve() : chrome.once('exit',resolve));
  await rm(profile,{recursive:true,force:true});
}
