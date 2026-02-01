'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    return { error: 'Server configuration error: Admin credentials not set in environment.' }
  }

  if (email === adminEmail && password === adminPassword) {
    const cookieStore = await cookies()
    cookieStore.set('paygrid_admin_session', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 // 1 day
    })
    redirect('/dashboard')
  } else {
    return { error: 'Invalid email or password' }
  }
}

export async function logout() {
  const cookieStore = await cookies();
  // Delete the admin session cookie with same path and immediate expiration
  cookieStore.set('paygrid_admin_session', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  cookieStore.delete("paygrid_admin_session")
  redirect('/');
}
