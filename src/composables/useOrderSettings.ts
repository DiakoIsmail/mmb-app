import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const acceptingOrders = ref(true)
let initialized = false

export async function initOrderSettings() {
  if (initialized) return
  initialized = true

  const { data } = await supabase
    .from('settings')
    .select('accepting_orders')
    .eq('id', 1)
    .single()

  if (data) acceptingOrders.value = data.accepting_orders

  supabase
    .channel('settings-realtime')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'settings', filter: 'id=eq.1' },
      (payload) => {
        acceptingOrders.value = (payload.new as { accepting_orders: boolean }).accepting_orders
      }
    )
    .subscribe()
}

export async function toggleAcceptingOrders(value: boolean) {
  await supabase
    .from('settings')
    .update({ accepting_orders: value })
    .eq('id', 1)
  acceptingOrders.value = value
}

export function useOrderSettings() {
  return { acceptingOrders }
}
