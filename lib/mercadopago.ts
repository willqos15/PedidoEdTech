// SDK do Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';
// Adicione credenciais
const client = new MercadoPagoConfig({ accessToken: 'YOUR_ACCESS_TOKEN' });

const preference = new Preference(client);

preference.create({
    body: {
        items: [
            {   id: '1',
                title: 'Meu produto',
                quantity: 1,
                unit_price: 2000
            }
        ],
    }
})
    .then(console.log)
    .catch(console.log);