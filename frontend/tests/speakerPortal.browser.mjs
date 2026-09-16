import { spawn } from 'node:child_process';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { demoAccounts } from '../src/auth/demoConfig.js';
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


  const setField = async (selector,value) => {
    await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));})()`);await settle();
  };
  const selectPortal = async role => {
    await evaluate(`(()=>{const el=document.querySelector('#login-portal');el.value=${JSON.stringify(role)};el.dispatchEvent(new Event('change',{bubbles:true}));})()`);await settle();
  };
  for (const width of [320,768,1440]) {
    await cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await navigate('/');await evaluate('sessionStorage.clear()');
    for (const path of ['/speaker','/attendee','/attendee/travel','/attendee/hotel','/attendee/car','/speaker/proposals/proposal-bill-nye']) {
      await navigate(path);assert.equal(await evaluate('location.pathname'),'/login');await noOverflow();
    }
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('form input')].map(el=>[el.value,el.disabled])`),[['',false],['',false]]);
    assert.equal(await evaluate('document.querySelector("#login-portal").value'),'');
    assert.equal(await evaluate(`(()=>{const controls=[...document.querySelectorAll('form select, form input, form button')];return controls.every(el=>{const r=el.getBoundingClientRect();return r.width>0 && r.left>=0 && r.right<=innerWidth}) && controls.every((el,i)=>!i || el.getBoundingClientRect().top>=controls[i-1].getBoundingClientRect().bottom)})()`),true);
    assert.equal(await evaluate('document.querySelector("label[for=login-portal]").textContent'),'Choose your portal');
    assert.deepEqual(await evaluate(`[...document.querySelector('#login-portal').options].map(el=>el.textContent)`),['Select a portal','Attendee Portal','Speaker Portal']);
    assert.doesNotMatch(await evaluate('document.body.innerText'),/Frontend demo|Use attendee demo credentials|Use speaker demo credentials|demonstration identities/);
    await evaluate(`document.querySelector('#login-portal').focus()`);
    assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineStyle'),'solid');
    await key('Tab','Tab',9);
    assert.equal(await evaluate('document.activeElement.id'),'login-email');
    assert.equal(await evaluate('location.pathname'),'/login');
    await setField('#login-email','different@example.test');await setField('#login-password','different-password');
    assert.equal(await evaluate('document.querySelector("#login-email").value'),'different@example.test');
    await selectPortal('ATTENDEE');
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('form input')].map(el=>el.value)`),[demoAccounts.ATTENDEE.email,demoAccounts.ATTENDEE.password]);
    assert.equal(await evaluate('location.pathname'),'/login');
    assert.equal(await evaluate('sessionStorage.getItem("steamcon.auth")'),null);
    await setField('#login-email','');await setField('#login-password','');
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('form input')].map(el=>el.value)`),['','']);
    await setField('#login-email','another@example.test');await setField('#login-password','another-password');
    assert.equal(await evaluate('document.querySelector("#login-password").value'),'another-password');
    await selectPortal('SPEAKER');
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('form input')].map(el=>el.value)`),[demoAccounts.SPEAKER.email,demoAccounts.SPEAKER.password]);
    assert.equal(await evaluate('location.pathname'),'/login');
    assert.equal(await evaluate('sessionStorage.getItem("steamcon.auth")'),null);
    await click('form button[type="button"]');assert.equal(await evaluate('document.querySelector("#login-password").type'),'text');
    await setField('#login-password','wrong');await click('form button[type="submit"]');
    assert.match(await evaluate('document.body.innerText'),/Invalid email or password/);
    assert.equal(await evaluate('document.activeElement.getAttribute("role")'),'alert');
    await selectPortal('SPEAKER');await click('form button[type="submit"]');
    assert.equal(await evaluate('location.pathname'),'/speaker');
    await navigate('/speaker');assert.match(await evaluate('document.body.innerText'),/Welcome back, Bill/);
    assert.equal(await evaluate('document.querySelectorAll("select").length'),0);await noOverflow();
    await navigate('/speaker');assert.match(await evaluate('document.body.innerText'),/Bill Nye/);
    assert.equal(await evaluate('JSON.stringify(sessionStorage).includes("SteamConDemo!")'),false);
    await navigate('/attendee');assert.equal(await evaluate('location.pathname'),'/access-denied');await noOverflow();
    assert.equal(await evaluate('document.querySelector("main a").getAttribute("href")'),'/speaker');
    await click('main button');assert.equal(await evaluate('location.pathname'),'/');
    assert.equal(await evaluate('sessionStorage.getItem("steamcon.auth")'),null);
    await navigate('/login');await selectPortal('ATTENDEE');await click('form button[type="submit"]');
    assert.equal(await evaluate('location.pathname'),'/attendee');await noOverflow();
    await navigate('/attendee');assert.equal(await evaluate('location.pathname'),'/attendee');
    for (const path of ['/attendee/travel','/attendee/hotel','/attendee/car']) {await navigate(path);assert.equal(await evaluate('location.pathname'),path);await noOverflow();}
    await navigate('/speaker');assert.equal(await evaluate('location.pathname'),'/access-denied');await noOverflow();
    await navigate('/speakers');assert.equal(await evaluate('document.querySelectorAll("[id^=speaker-]").length'),15);
    await click('.nav-login summary');await noOverflow();
    await key('Escape','Escape',27);
    assert.equal(await evaluate('document.querySelector(".nav-login").open'),false);
    assert.equal(await evaluate('document.activeElement.tagName'),'SUMMARY');
    await click('.nav-login summary');await click('h1');
    assert.equal(await evaluate('document.querySelector(".nav-login").open'),false);
    await click('.nav-login summary');await click('.nav-login button');
    assert.equal(await evaluate('location.pathname'),'/');assert.equal(await evaluate('sessionStorage.getItem("steamcon.auth")'),null);
    console.log(`PASS: ${width}px editable login, both demos, redirect, roles, restoration, logout, public directory and preserved child routes`);
  }
  // Stub only the existing login endpoint to prove backend UI states without a running API.
  await navigate('/login');
  await selectPortal('ATTENDEE');
  await setField('#login-email','normal@example.test');await setField('#login-password','editable-password');
  await evaluate(`window.fetch = (url,options) => { window.submittedLogin = {url,body:JSON.parse(options.body)}; return new Promise(resolve => { window.finishLogin = resolve; }); }`);
  await click('form button[type="submit"]');
  assert.deepEqual(await evaluate('window.submittedLogin'),{url:'/api/auth/login',body:{email:'normal@example.test',password:'editable-password'}});
  assert.equal(await evaluate('document.querySelector("form").getAttribute("aria-busy")'),'true');
  assert.equal(await evaluate('document.querySelector("form button[type=submit]").disabled'),true);
  await evaluate(`window.finishLogin({ok:false,status:500,text:async () => 'Service unavailable'})`);await settle();
  assert.match(await evaluate('document.body.innerText'),/could not complete your request/);
  assert.equal(await evaluate('document.activeElement.getAttribute("role")'),'alert');
  await evaluate(`window.fetch = async () => ({ok:true,json:async () => ({id:'backend-session',userId:'backend-user',status:'ACTIVE',expiresAt:new Date(Date.now()+3600000).toISOString()})})`);
  await click('form button[type="submit"]');
  assert.equal(await evaluate('location.pathname'),'/access-denied');
  assert.match(await evaluate('document.body.innerText'),/backend does not yet provide the role/);
  await click('main button');assert.equal(await evaluate('location.pathname'),'/');
  console.log('PASS: backend login loading, general error, unknown role and local logout UI states');
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
    await evaluate('sessionStorage.clear()');
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
      ['Events', '/#events'], ['Tracks', '/#tracks'], ['Speakers', '/speakers'], ['Travel', '/#travel'], ['Log in', '/login'],
    ]);
    assert.equal(await evaluate('document.querySelectorAll(".nav-login").length'),0);
    assert.equal(await evaluate(`document.querySelectorAll('header a[href="/login"]').length`),1);
    assert.doesNotMatch(await text(), /Continue as Attendee|Continue as Speaker|Frontend demo access|Log in with another account/);
    await click('header a[href="/login"]');
    assert.equal(await evaluate('location.pathname'),'/login');
    await selectPortal('ATTENDEE');await click('form button[type="submit"]');
    assert.equal(await evaluate('location.pathname'),'/attendee');
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
    await navigate('/attendee');
    await click('.auth-account-navigation button');
    await navigate('/speakers');
    await click('header a[href="/login"]');
    await selectPortal('SPEAKER');
    await evaluate(`document.querySelector('form button[type="submit"]').focus()`);
    await key('Enter','Enter',13);
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
