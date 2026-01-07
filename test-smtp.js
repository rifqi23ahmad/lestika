// Simpan sebagai test-smtp.js
import nodemailer from 'nodemailer';

// GANTI DENGAN DATA DARI DASHBOARD SUPABASE -> SMTP SETTINGS
const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',
    pass: 're_We9Ueq6B_AVn42qNRgdGrdNZVpbYSBcVw', // Ganti dengan API KEY Resend Anda
  },
});

async function main() {
  try {
    // GANTI 'from' DENGAN SENDER EMAIL YANG ANDA TULIS DI SUPABASE
    const info = await transporter.sendMail({
      from: 'Bimbel MAPA <noreply@emails.bimbelmapa.my.id>', 
      to: 'laporantb2@yopmail.com', // Ganti dengan email penerima
      subject: 'Tes Koneksi SMTP Manual',
      text: 'Jika email ini masuk, berarti credentials Resend valid 100%.',
    });
    console.log('✅ Email terkirim! Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Gagal kirim email:', error);
  }
}

main();