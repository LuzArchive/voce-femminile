const { createClient } = require('@supabase/supabase-js')
const QRCode = require('qrcode')
const { Resend } = require('resend')
const crypto = require('crypto')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

const handler = async (req, res) => {
  if (req.method === 'GET') return res.status(200).send('OK')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo no permitido' })

  const { type, data } = req.body
  if (type !== 'payment') return res.status(200).json({ message: 'Ignorado' })

  try {
    const pagoRes = await fetch('https://api.mercadopago.com/v1/payments/' + data.id, {
      headers: { 'Authorization': 'Bearer ' + process.env.MP_ACCESS_TOKEN },
    })
    const pago = await pagoRes.json()

    if (pago.status !== 'approved') return res.status(200).json({ message: 'No aprobado' })

    const boleto_id = pago.external_reference

    const { data: boleto, error: errorBoleto } = await supabase
      .from('boletos').select('*').eq('id', boleto_id).single()

    if (errorBoleto || !boleto) return res.status(404).json({ error: 'Boleto no encontrado' })
    if (boleto.estado === 'pagado') return res.status(200).json({ message: 'Ya procesado' })

    // Generar UUID sin depender del paquete uuid
    const codigo_qr = crypto.randomUUID()

    // Generar imagen QR en base64
    const qrDataUrl = await QRCode.toDataURL(codigo_qr, {
      width: 300,
      margin: 2,
      color: { dark: '#0a0a0a', light: '#ffffff' }
    })
    const qrBase64 = qrDataUrl.split(',')[1]

    // Guardar en Supabase
    await supabase.from('boletos').update({
      estado: 'pagado',
      codigo_qr: codigo_qr,
      payment_id: String(pago.id),
    }).eq('id', boleto_id)

    // Lista de boletos para el correo
    const listaBoletos = Array.from({ length: boleto.cantidad }, (_, i) =>
      '<li style="margin-bottom:4px;">Boleto #' + (i + 1) + ' — Verdades de Media Noche</li>'
    ).join('')

    // Enviar correo
    await resend.emails.send({
      from: 'Voce Femminile <' + process.env.RESEND_FROM_EMAIL + '>',
      to: boleto.email,
      subject: 'Tu boleto para Verdades de Media Noche',
      html: `
        <div style="font-family:'Helvetica Neue',sans-serif;max-width:520px;margin:0 auto;color:#1f2937;">
          <div style="text-align:center;padding:2rem 0 1rem;">
            <h1 style="font-size:1.8rem;letter-spacing:0.2em;font-weight:400;color:#0a0a0a;margin:0;">
              VOCE FEMMINILE
            </h1>
          </div>
          <div style="background:#f9f9f7;border:1px solid #e5e7eb;border-radius:16px;padding:2rem;margin-bottom:1.5rem;">
            <p style="margin:0 0 0.5rem;font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:#6b7280;">
              Espectaculo Coral
            </p>
            <h2 style="font-size:2rem;margin:0 0 1.5rem;color:#0a0a0a;">
              Verdades de Media Noche
            </h2>
            <div style="display:flex;gap:1rem;margin-bottom:1.5rem;">
              <div style="flex:1;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:1rem;">
                <p style="margin:0 0 0.25rem;font-size:0.7rem;text-transform:uppercase;color:#6b7280;">Fecha</p>
                <p style="margin:0;font-weight:600;color:#0a0a0a;">9 de Marzo, 2026</p>
                <p style="margin:0;font-size:0.9rem;color:#6b7280;">5:00 PM</p>
              </div>
              <div style="flex:1;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:1rem;">
                <p style="margin:0 0 0.25rem;font-size:0.7rem;text-transform:uppercase;color:#6b7280;">Lugar</p>
                <p style="margin:0;font-weight:600;color:#0a0a0a;">Teatro Principal</p>
                <p style="margin:0;font-size:0.9rem;color:#6b7280;">Junto a San Luis Obispo</p>
              </div>
            </div>
            <p style="margin:0 0 0.5rem;font-size:0.85rem;color:#6b7280;">
              Hola <strong style="color:#0a0a0a;">${boleto.nombre}</strong>, tus boletos:
            </p>
            <ul style="margin:0 0 1.5rem;padding-left:1.2rem;color:#1f2937;font-size:0.9rem;">
              ${listaBoletos}
            </ul>
            <div style="text-align:center;">
              <p style="margin:0 0 0.75rem;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;">
                Presenta este codigo en la entrada
              </p>
              <img
                src="cid:qr-boleto"
                alt="Codigo QR"
                style="width:200px;height:200px;border:4px solid #10b981;border-radius:12px;"
              />
              <p style="margin:0.75rem 0 0;font-size:0.7rem;color:#9ca3af;word-break:break-all;">
                ID: ${codigo_qr}
              </p>
            </div>
          </div>
          <p style="text-align:center;font-size:0.8rem;color:#9ca3af;">
            Dudas: <a href="https://wa.me/522472803489" style="color:#10b981;">+52 247-280-3489</a>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: 'qr-boleto.png',
          content: qrBase64,
          content_id: 'qr-boleto',
          encoding: 'base64',
        },
      ],
    })

    console.log('Boleto pagado y correo enviado:', boleto_id)
    return res.status(200).json({ success: true })

  } catch (error) {
    console.error('Error webhook:', error)
    return res.status(500).json({ error: 'Error interno' })
  }
}

module.exports = handler
