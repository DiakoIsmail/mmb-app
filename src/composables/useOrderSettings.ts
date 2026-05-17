import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const acceptingOrders = ref(true)
const bakeselEnabled = ref(true)
const tartaEnabled = ref(true)
const magiEnabled = ref(true)
let initialized = false

type SettingsRow = {
  accepting_orders: boolean
  bakelse_enabled: boolean
  tarta_enabled: boolean
  magi_enabled: boolean
}

function applySettings(data: SettingsRow) {
  acceptingOrders.value = data.accepting_orders
  bakeselEnabled.value = data.bakelse_enabled
  tartaEnabled.value = data.tarta_enabled
  magiEnabled.value = data.magi_enabled
}

export async function initOrderSettings() {
  if (initialized) return
  initialized = true

  const { data } = await supabase
    .from('settings')
    .select('accepting_orders, bakelse_enabled, tarta_enabled, magi_enabled')
    .eq('id', 1)
    .single()

  if (data) applySettings(data as SettingsRow)

  supabase
    .channel('settings-realtime')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'settings', filter: 'id=eq.1' },
      (payload) => {
        applySettings(payload.new as SettingsRow)
      }
    )
    .subscribe()
}

export async function toggleAcceptingOrders(value: boolean) {
  await supabase.from('settings').update({ accepting_orders: value }).eq('id', 1)
  acceptingOrders.value = value
}

export async function toggleCategory(
  category: 'bakelse_enabled' | 'tarta_enabled' | 'magi_enabled',
  value: boolean
) {
  await supabase.from('settings').update({ [category]: value }).eq('id', 1)
  if (category === 'bakelse_enabled') bakeselEnabled.value = value
  else if (category === 'tarta_enabled') tartaEnabled.value = value
  else magiEnabled.value = value
}

export function useOrderSettings() {
  return { acceptingOrders, bakeselEnabled, tartaEnabled, magiEnabled }
}
