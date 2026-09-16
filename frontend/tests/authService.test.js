/* global global */
import test from 'node:test'
import assert from 'node:assert/strict'
import { authService, authenticatedFetch } from '../src/services/authService.js'
import { demoAccounts } from '../src/auth/demoConfig.js'
const values = new Map()
global.sessionStorage = {getItem:key => values.get(key) ?? null,setItem:(key,value) => values.set(key,value),removeItem:key => values.delete(key)}
global.window = {location:{origin:'https://steamcon.test'}}
test('isolated demos restore without stored passwords or fake backend headers',async () => {
 for (const role of ['ATTENDEE','SPEAKER']) {
  const session=await authService.loginAsDemo(role)
  assert.equal(session.user.role,role)
  assert.equal(session.user.displayName, role === 'ATTENDEE' ? 'Avery' : 'Bill Nye')
  assert.equal((await authService.restore()).user.displayName, role === 'ATTENDEE' ? 'Avery' : 'Bill Nye')
  assert.equal((await authService.restore()).user.displayName,demoAccounts[role].displayName)
  assert.equal([...values.values()].join('').includes(demoAccounts[role].password),false)
  assert.deepEqual(authService.headers(),{})
  await authService.logout();assert.equal(values.size,0)
 }
 await assert.rejects(authService.login({email:demoAccounts.SPEAKER.email,password:'wrong'}),{code:'credentials'})
})
for (const [role, displayName, email] of [
 ['ATTENDEE', 'Avery', 'attendee@steamcon.demo'],
 ['SPEAKER', 'Bill Nye', 'speaker@steamcon.demo'],
]) test(`${role} demo login and stored-session restoration display ${displayName}`, async () => {
 const session = await authService.login({email, password:'SteamConDemo!'})
 assert.equal(session.user.displayName, displayName)
 assert.equal(session.user.role, role)
 // A stored display name must not override the centralized demo identity.
 values.set('steamcon.auth', JSON.stringify({...session, user:{...session.user, displayName:'Stale name'}}))
 const restored = await authService.restore()
 assert.equal(restored.user.displayName, displayName)
 assert.equal(restored.user.role, role)
 await authService.logout()
})

test('backend credentials, current session and logout use confirmed contracts',async () => {
 let request
 global.fetch=async (url,options) => {request={url,options};return {ok:true,json:async () => ({sessionId:'11111111-1111-4111-8111-111111111111',createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+3600000).toISOString(),status:'ACTIVE',user:{id:'22222222-2222-4222-8222-222222222222',email:'someone@example.test',displayName:'Speaker',organization:'STEAM',roles:['ATTENDEE','SPEAKER']}})}}
 const session=await authService.login({email:'someone@example.test',password:'editable-value'})
 assert.equal(request.url,'/api/auth/login');assert.equal(request.options.method,'POST')
 assert.deepEqual(JSON.parse(request.options.body),{email:'someone@example.test',password:'editable-value'})
 assert.equal(session.user.displayName,'Speaker');assert.notEqual(session.user.displayName,'Avery');assert.equal(session.user.role,'SPEAKER');assert.deepEqual(session.user.roles,['ATTENDEE','SPEAKER']);assert.equal(session.user.organization,'STEAM')
 assert.deepEqual(authService.headers(),{'X-Session-Id':'11111111-1111-4111-8111-111111111111'})
 await authenticatedFetch('/api/future',{headers:{Accept:'application/json'}})
 assert.equal(request.options.headers.get('X-Session-Id'),'11111111-1111-4111-8111-111111111111')
 assert.equal(request.options.headers.get('Accept'),'application/json')
 assert.throws(() => authenticatedFetch('https://other.test/api'),/application API origin/)
 assert.equal((await authService.restore()).user.displayName,'Speaker');assert.equal(request.url,'/api/auth/me');assert.equal(request.options.method ?? 'GET','GET');assert.equal(request.options.headers['X-Session-Id'],session.sessionId)
 await authService.logout();assert.equal(request.url,'/api/auth/logout');assert.equal(request.options.method,'POST');assert.equal(values.size,0)
})
test('credential, network, malformed-response and expired-storage failures',async () => {
 global.fetch=async () => ({ok:false,status:500,text:async () => 'Invalid email or password'})
 await assert.rejects(authService.login({email:'normal@example.test',password:'wrong'}),{code:'credentials'})
 global.fetch=async () => {throw new Error('offline')}
 await assert.rejects(authService.login({email:'normal@example.test',password:'wrong'}),{code:'general'})
 global.fetch=async () => ({ok:true,json:async () => ({token:'invented'})})
 await assert.rejects(authService.login({email:'normal@example.test',password:'wrong'}),/invalid session/)
 values.set('steamcon.auth','{broken');assert.equal(await authService.restore(),null)
 values.set('steamcon.auth',JSON.stringify({source:'demo',user:{role:'SPEAKER'},expiresAt:'2000-01-01'}));assert.equal(await authService.restore(),null)
})

test('restoration rejects stale identities and revoked sessions', async () => {
 values.set('steamcon.auth',JSON.stringify({source:'backend',sessionId:'11111111-1111-4111-8111-111111111111',expiresAt:new Date(Date.now()+60000).toISOString(),user:{id:'22222222-2222-4222-8222-222222222222',role:'SPEAKER'}}))
 global.fetch=async () => ({ok:false,status:401})
 assert.equal(await authService.restore(),null)
 assert.equal(values.size,0)
})

test('backend roles are authoritative and failed logout still clears local storage', async () => {
 const response = {sessionId:'11111111-1111-4111-8111-111111111111',createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+60000).toISOString(),status:'ACTIVE',user:{id:'22222222-2222-4222-8222-222222222222',email:'normal@example.test',displayName:'User',organization:null,roles:[]}}
 global.fetch=async () => ({ok:true,json:async () => response})
 assert.equal((await authService.login({email:response.user.email,password:'password'})).user.role,null)
 response.user.roles=['ATTENDEE']
 const restored = await authService.restore()
 assert.equal(restored.user.role,'ATTENDEE')
 assert.equal(restored.user.displayName,'User')
 assert.notEqual(restored.user.displayName,'Avery')
 global.fetch=async () => {throw new Error('offline')}
 await assert.rejects(() => authService.logout(),/offline/)
 assert.equal(values.size,0)
})
