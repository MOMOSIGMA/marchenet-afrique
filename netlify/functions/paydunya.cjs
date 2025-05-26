const axios = require('axios');

exports.handler = async (event) => {
  console.log('Requête reçue:', event.httpMethod, event.body);
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const {
    total_amount,
    description,
    pack_name,
    vendor_data,
    user_id,
  } = JSON.parse(event.body);

  console.log('Données reçues:', { total_amount, pack_name, user_id });

  try {
    console.log('Tentative de connexion à PayDunya avec:', {
      masterKey: process.env.PAYDUNYA_MASTER_KEY ? 'Présent' : 'Absent',
      publicKey: process.env.PAYDUNYA_PUBLIC_KEY ? 'Présent' : 'Absent',
      privateKey: process.env.PAYDUNYA_PRIVATE_KEY ? 'Présent' : 'Absent',
      token: process.env.PAYDUNYA_TOKEN ? 'Présent' : 'Absent',
    });

    const response = await axios.post(
      'https://app.paydunya.com/api/v1/checkout-invoice/create',
      {
        invoice: {
          total_amount,
          description,
          currency: 'XOF',
          items: [
            {
              name: pack_name,
              quantity: 1,
              unit_price: total_amount,
              description: `${pack_name} pour ${vendor_data.shop_name}`,
            },
          ],
        },
        store: {
          name: 'MarchéNet Afrique',
          tagline: 'La plateforme des vendeurs africains',
          phone: '+221123456789',
          website_url: 'https://marche-net-afrique.netlify.app/',
        },
        actions: {
          callback_url: 'https://marche-net-afrique.netlify.app/profile',
          return_url: 'https://marche-net-afrique.netlify.app/profile',
          cancel_url: 'https://marche-net-afrique.netlify.app/devenir-vendeur',
        },
        custom_data: {
          mode: 'test',
          user_id,
          pack_name,
          vendor_data,
        },
      },
      {
        headers: {
          'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
          'PAYDUNYA-PUBLIC-KEY': process.env.PAYDUNYA_PUBLIC_KEY,
          'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
          'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Réponse de PayDunya:', response.data);

    if (response.data.response_code === '00') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          paymentUrl: response.data.response_text || `https://paydunya.com/checkout/invoice/${response.data.token}`,
        }),
      };
    } else {
      throw new Error('Échec de la création de la facture');
    }
  } catch (error) {
    console.error('Erreur dans paydunya:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.response?.data?.response_text || error.message,
      }),
    };
  }
};