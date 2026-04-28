const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo no permitido' })
  }

  const { boleto_id, nombre, email, cantidad, monto_total } = req.body

  if (!boleto_id || !nombre || !email || !cantidad || !monto_total) {
    return res.status(400).json({ error: 'Faltan datos requeridos' })
  }

  const APP_URL = process.env.APP_URL || 'https://voce-femminile-eh4r.vercel.app'

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.MP_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        items: [
          {
            id: boleto_id,
            title: 'Verdades de Media Noche - Voce Femminile',
            description: 'Espectaculo coral ' + cantidad + (cantidad === 1 ? ' boleto' : ' boletos'),
            quantity: 1,
            currency_id: 'MXN',
            unit_price: Number(monto_total),
          },
        ],
        payer: {
          name: nombre,
          email: email,
        },
        back_urls: {
          success: APP_URL + '/pago-exitoso?boleto_id=' + boleto_id,
          failure: APP_URL + '/pago-fallido?boleto_id=' + boleto_id,
          pending: APP_URL + '/pago-pendiente?boleto_id=' + boleto_id,
        },
        auto_return: 'approved',
        notification_url: APP_URL + '/api/webhook-mp',
        external_reference: boleto_id,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Error MP:', data)
      return res.status(500).json({ error: 'Error al crear preferencia de pago', detalle: data })
    }

    return res.status(200).json({
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
      preference_id: data.id,
      boleto_id: boleto_id,
    })

  } catch (error) {
    console.error('Error servidor:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = handler
