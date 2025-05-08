// Paystack configuration
export const paystackConfig = {
  publicKey: process.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_04cecd786eaed713e065a61d330535507b4cc05a',
  currency: 'ZAR',
  channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
  label: 'MokMzansi Books',
};
