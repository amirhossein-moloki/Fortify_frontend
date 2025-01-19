'use server'

import { Analytics } from "@vercel/analytics/react"
import { redirect } from 'next/navigation'

export async function redirectToChat() {
  redirect('/chat')
}

