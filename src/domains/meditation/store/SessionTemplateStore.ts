import { SessionTemplate } from '../engine/types'

export interface SessionTemplateStore {
  list(): Promise<SessionTemplate[]>
  get(id: string): Promise<SessionTemplate | null>
  save(t: SessionTemplate): Promise<void>
  remove(id: string): Promise<void>
}
