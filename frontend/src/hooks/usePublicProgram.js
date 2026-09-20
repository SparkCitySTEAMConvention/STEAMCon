import { useMemo } from 'react'
import { eventRepository } from '../services/eventRepository.js'
import { createPublicProgramSource } from '../services/publicProgramSource.js'
import useSpeakerResource from './useSpeakerResource.js'

export default function usePublicProgram() {
  const source = useMemo(() => createPublicProgramSource(eventRepository), [])
  const resource = useSpeakerResource(source.load, source)
  return { source, resource }
}
