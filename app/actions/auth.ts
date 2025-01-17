'use server'

import { redirect } from 'next/navigation'

export async function redirectToChat() {
  redirect('/chat')
}

