import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard({ session }) {
  const [loading, setLoading] = useState(true);
  // Contoh data dummy, nanti bisa diganti fetch dari database Supabase
  const [paket, setPaket] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    // Simulasi fetch data profile/paket user
    // Di real app: const { data } = await supabase.from('packages').select('*').eq('user_id', session.user.id)
    setTimeout(() => {
        setPaket([
            { id: 1, nama: 'Paket SD Juara', sesi: '8 Sesi/Bulan', status: 'Aktif' }
        ]);
        setInvoices([
            { id: 'INV-001', tanggal: '2025-01-20', jumlah: 'Rp 800.000', status: 'Lunas' }
        ]);
        setLoading(false);
    }, 1000);
  }, [session]);

  return (
    <div className="container section-padding">
        <h1>Halo, {session?.user?.email}</h1>
        <p>Selamat datang di Dashboard Siswa MAPA.</p>

        <div style={{marginTop: '40px'}}>
            <h3>Paket Belajar Aktif</h3>
            {loading ? <p>Loading...</p> : (
                <div className="system-cards" style={{justifyContent: 'flex-start'}}>
                    {paket.map(p => (
                        <div key={p.id} className="card" style={{border: '1px solid #eee'}}>
                            <h3 style={{color: '#28a745'}}>{p.nama}</h3>
                            <p>{p.sesi}</p>
                            <span className="btn-secondary" style={{padding: '5px 10px', fontSize: '0.8em'}}>{p.status}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div style={{marginTop: '40px'}}>
            <h3>Riwayat Invoice</h3>
            <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '20px'}}>
                <thead>
                    <tr style={{background: '#f8f9fa', textAlign: 'left'}}>
                        <th style={{padding: '10px'}}>No. Invoice</th>
                        <th style={{padding: '10px'}}>Tanggal</th>
                        <th style={{padding: '10px'}}>Total</th>
                        <th style={{padding: '10px'}}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(inv => (
                        <tr key={inv.id} style={{borderBottom: '1px solid #eee'}}>
                            <td style={{padding: '10px'}}>{inv.id}</td>
                            <td style={{padding: '10px'}}>{inv.tanggal}</td>
                            <td style={{padding: '10px'}}>{inv.jumlah}</td>
                            <td style={{padding: '10px'}}>
                                <span style={{color: 'green', fontWeight: 'bold'}}>{inv.status}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}