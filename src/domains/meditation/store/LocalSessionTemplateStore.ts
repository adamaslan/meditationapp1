import { SessionTemplate } from '../engine/types'
import { SessionTemplateStore } from './SessionTemplateStore'

const STORAGE_KEY = 'meditation:templates'

export class LocalSessionTemplateStore implements SessionTemplateStore {
  async list(): Promise<SessionTemplate[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        return []
      }
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.warn(
        '[LocalSessionTemplateStore] Failed to list templates:',
        error instanceof Error ? error.message : String(error)
      )
      return []
    }
  }

  async get(id: string): Promise<SessionTemplate | null> {
    const templates = await this.list()
    return templates.find((t) => t.id === id) || null
  }

  async save(t: SessionTemplate): Promise<void> {
    try {
      const templates = await this.list()
      const existingIndex = templates.findIndex((x) => x.id === t.id)

      if (existingIndex >= 0) {
        templates[existingIndex] = t
      } else {
        templates.push(t)
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
    } catch (error) {
      console.warn(
        '[LocalSessionTemplateStore] Failed to save template:',
        error instanceof Error ? error.message : String(error)
      )
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const templates = await this.list()
      const filtered = templates.filter((t) => t.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.warn(
        '[LocalSessionTemplateStore] Failed to remove template:',
        error instanceof Error ? error.message : String(error)
      )
    }
  }
}
