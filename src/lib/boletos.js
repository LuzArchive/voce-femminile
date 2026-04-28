import { supabase } from './supabase'

export async function getBoletosDisponibles() {
  const { data: config } = await supabase
    .from('configuracion')
    .select('total_boletos')
    .eq('id', 1)
    .single()

  const { count } = await supabase
    .from('boletos')
    .select('*', { count: 'exact', head: true })
    .in('estado', ['pendiente', 'pagado'])

  const disponibles = (config?.total_boletos ?? 120) - (count ?? 0)
  return Math.max(0, disponibles)
}

export async function crearBoletoPendiente({ nombre, email, telefono, cantidad }) {
  const precio = 45
  const monto_total = precio * cantidad

  const { data, error } = await supabase
    .from('boletos')
    .insert([{ nombre, email, telefono, cantidad, monto_total, estado: 'pendiente' }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function crearPreferenciaPago({ boleto_id, nombre, email, cantidad, monto_total }) {
  const response = await fetch('/api/crear-preferencia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ boleto_id, nombre, email, cantidad, monto_total }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Error al crear el pago')
  }

  // Guardar boleto_id en sessionStorage para recuperarlo al volver
  sessionStorage.setItem('ultimo_boleto_id', boleto_id)

  return data
}
