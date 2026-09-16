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
  assert.equal(authService.restore().user.displayName,demoAccounts[role].displayName)
  assert.equal([...values.values()].join('').includes(demoAccounts[role].password),false)
  assert.deepEqual(authService.headers(),{})
  await authService.logout();assert.equal(values.size,0)
 }
 await assert.rejects(authService.login({email:demoAccounts.SPEAKER.email,password:'wrong'}),{code:'credentials'})
})
test('editable normal credentials use exact backend contract without role inference',async () => {
 let request
 global.fetch=async (url,options) => {request={url,options};return {ok:true,json:async () => ({id:'session-uuid',userId:'user-uuid',expiresAt:new Date(Date.now()+3600000).toISOString(),status:'ACTIVE'})}}
 const session=await authService.login({email:'someone@example.test',password:'editable-value'})
 assert.equal(request.url,'/api/auth/login');assert.equal(request.options.method,'POST')
 assert.deepEqual(JSON.parse(request.options.body),{email:'someone@example.test',password:'editable-value'})
 assert.deepEqual(session.user,{id:'user-uuid',role:null})
 assert.deepEqual(authService.headers(),{'X-Session-Id':'session-uuid'})
 await authenticatedFetch('/api/future',{headers:{Accept:'application/json'}})
 assert.equal(request.options.headers.get('X-Session-Id'),'session-uuid')
 assert.equal(request.options.headers.get('Accept'),'application/json')
 assert.throws(() => authenticatedFetch('https://other.test/api'),/application API origin/)
 assert.equal(authService.restore(),null);assert.equal(values.size,0)
})
test('credential, network, malformed-response and expired-storage failures',async () => {
 global.fetch=async () => ({ok:false,status:500,text:async () => 'Invalid email or password'})
 await assert.rejects(authService.login({email:'normal@example.test',password:'wrong'}),{code:'credentials'})
 global.fetch=async () => {throw new Error('offline')}
 await assert.rejects(authService.login({email:'normal@example.test',password:'wrong'}),{code:'general'})
 global.fetch=async () => ({ok:true,json:async () => ({token:'invented'})})
 await assert.rejects(authService.login({email:'normal@example.test',password:'wrong'}),/invalid session/)
 values.set('steamcon.auth','{broken');assert.equal(authService.restore(),null)
 values.set('steamcon.auth',JSON.stringify({source:'demo',user:{role:'SPEAKER'},expiresAt:'2000-01-01'}));assert.equal(authService.restore(),null)
})
