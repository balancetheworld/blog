import { ProfileModel } from '../models/profile.model'

export const ProfileService = {
  get: () => {
    const profile = ProfileModel.find()
    if (!profile) {
      throw new Error('Profile not found')
    }
    return profile
  },

  update: (data: {
    name?: string
    username?: string
    avatar?: string
    introduce?: string
    github?: string
    twitter?: string
    email?: string
  }) => {
    ProfileModel.update(data)
    return ProfileModel.find()
  },
}
