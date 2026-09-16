// Public frontend demo identities, not seeded database accounts.
export const demoEnabled = import.meta.env?.VITE_ENABLE_DEMO_AUTH !== 'false'
export const demoAccounts = {
 ATTENDEE: {email:'attendee@steamcon.demo', password:'SteamConDemo!', displayName:'Demo Attendee', role:'ATTENDEE'},
 SPEAKER: {email:'speaker@steamcon.demo', password:'SteamConDemo!', displayName:'Bill Nye', role:'SPEAKER'},
}
