import { getDatabase } from '../database/connection'

export interface Profile {
  id: number
  name: string
  username: string
  avatar: string | null
  introduce: string
  github: string | null
  twitter: string | null
  email: string | null
}

export const ProfileModel = {
  find: (): Profile | undefined => {
    const db = getDatabase()
    const result = db.prepare('SELECT * FROM profile WHERE id = 1').get() as Profile | undefined
    return result
  },

  update: (profile: Partial<Omit<Profile, 'id'>>): void => {
    const db = getDatabase()
    const fields: string[] = []
    const values: unknown[] = []

    if (profile.name !== undefined) {
      fields.push('name = ?')
      values.push(profile.name)
    }
    if (profile.username !== undefined) {
      fields.push('username = ?')
      values.push(profile.username)
    }
    if (profile.avatar !== undefined) {
      fields.push('avatar = ?')
      values.push(profile.avatar)
    }
    if (profile.introduce !== undefined) {
      fields.push('introduce = ?')
      values.push(profile.introduce)
    }
    if (profile.github !== undefined) {
      fields.push('github = ?')
      values.push(profile.github)
    }
    if (profile.twitter !== undefined) {
      fields.push('twitter = ?')
      values.push(profile.twitter)
    }
    if (profile.email !== undefined) {
      fields.push('email = ?')
      values.push(profile.email)
    }

    if (fields.length > 0) {
      values.push(1)
      db.prepare(`UPDATE profile SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    }
  },
}
