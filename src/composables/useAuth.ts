import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)
export const isAdmin = ref(false)

export async function checkAdminRole(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    return data?.role === 'admin'
  } catch {
    return false
  }
}

export async function initAuth() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null
    if (user.value) isAdmin.value = await checkAdminRole(user.value.id)
  } catch {
    // silently fail — app still loads
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    user.value = session?.user ?? null
    isAdmin.value = user.value ? await checkAdminRole(user.value.id) : false
  })
}

export async function signInAsAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error

  const admin = await checkAdminRole(data.user.id)
  if (!admin) {
    await supabase.auth.signOut()
    throw new Error('Du har inte admin-behörighet.')
  }

  user.value = data.user
  isAdmin.value = true
}

export async function signOut() {
  await supabase.auth.signOut()
  user.value = null
  isAdmin.value = false
}

export function useAuth() {
  return { user, isAdmin }
}
