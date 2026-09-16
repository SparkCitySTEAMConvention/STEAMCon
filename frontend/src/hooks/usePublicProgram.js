import { useMemo } from 'react'
import { useAuth } from '../auth/useAuth.js'
import { authService } from '../services/authService.js'
import { eventRepository } from '../services/eventRepository.js'
import { createPublicProgramSource } from '../services/publicProgramSource.js'
import useSpeakerResource from './useSpeakerResource.js'

export default function usePublicProgram() {
  const { user, authSource, isAuthenticated, hasBackendSession } = useAuth()
  const valid = authService.hasValidBackendSession()
  const source = useMemo(() => createPublicProgramSource(eventRepository,
    { user, authSource, isAuthenticated, hasBackendSession }, valid),
  [user, authSource, isAuthenticated, hasBackendSession, valid])
  const resource = useSpeakerResource(source.load, source)
  return { source, resource }
}
