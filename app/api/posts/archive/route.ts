import { NextResponse } from 'next/server'
import { postService } from '@/server/services/post.service'

export async function GET() {
  const archive = await postService.getArchive()
  return NextResponse.json(archive)
}
