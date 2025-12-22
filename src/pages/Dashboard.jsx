import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard({ session }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [paket, setPaket] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    async function fetchDashboardData() {
        if (!session?.user) return;

        const userId = session.user.id;

        try {
            // 1. Ambil data Profil (Nama Lengkap)
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', userId)
                .single();
            
            if (profileError && profileError.code !== 'PGRST116') {
                console.error('Error fetching profile:', profileError);
            }
            setProfile(profileData);

            // 2. Ambil Paket Belajar Aktif User
            const { data: paketData, error: paketError } = await supabase
                .from('user_packages')
                .select('*')
                .eq('user_id', userId);

            if (paketError) console.error('Error fetching packages:', paketError);
            setPaket(paketData || []);

            // 3. Ambil Riwayat Invoice User
            const { data: invoiceData, error: invoiceError } = await supabase
                .from('invoices')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false }); // Urutkan dari yang terbaru

            if (invoiceError) console.error('Error fetching invoices:', invoiceError);
            setInvoices(invoiceData || []);

        } catch (error) {
            console.error('Unexpected error:', error);
        } finally {
            setLoading(false);
        }
    }

    fetchDashboardData();
  }, [session]);

  return (
    <div className="container section-padding">
        {/* Tampilkan Nama dari Profile, fallback ke Email jika nama kosong */}
        <h1>Halo, {profile?.full_name || session?.user?.email}</h1>
        <p>Selamat datang di Dashboard Siswa MAPA.</p>

        <div style={{marginTop: '40px'}}>
            <h3>Paket Belajar Aktif</h3>
            {loading ? <p>Loading data...</p> : (
                <>
                    {paket.length === 0 ? (
                        <p style={{fontStyle:'italic', color:'#666'}}>Belum ada paket aktif.</p>
                    ) : (
                        <div className="system-cards" style={{justifyContent: 'flex-start', gap:'20px'}}>
                            {paket.map(p => (
                                <div key={p.id} className="card" style={{border: '1px solid #eee', width:'300px', textAlign:'left'}}>
                                    <h3 style={{color: '#28a745', fontSize:'1.2em'}}>{p.package_name}</h3>
                                    <p style={{marginBottom:'10px'}}>{p.session_info}</p>
                                    <span className="btn-secondary" style={{padding: '5px 10px', fontSize: '0.8em', borderRadius:'20px'}}>
                                        {p.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>

        <div style={{marginTop: '40px'}}>
            <h3>Riwayat Invoice</h3>
            {loading ? <p>Loading data...</p> : (
                <>
                     {invoices.length === 0 ? (
                        <p style={{fontStyle:'italic', color:'#666'}}>Belum ada riwayat tagihan.</p>
                     ) : (
                        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                            <thead>
                                <tr style={{background: '#f8f9fa', textAlign: 'left', borderBottom:'2px solid #eee'}}>
                                    <th style={{padding: '15px'}}>No. Invoice</th>
                                    <th style={{padding: '15px'}}>Tanggal</th>
                                    <th style={{padding: '15px'}}>Total</th>
                                    <th style={{padding: '15px'}}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map(inv => (
                                    <tr key={inv.id} style={{borderBottom: '1px solid #eee'}}>
                                        <td style={{padding: '15px', fontWeight:'bold'}}>{inv.id}</td>
                                        <td style={{padding: '15px'}}>{inv.invoice_date}</td>
                                        <td style={{padding: '15px'}}>{inv.amount_formatted}</td>
                                        <td style={{padding: '15px'}}>
                                            <span style={{
                                                color: inv.status === 'Lunas' ? 'green' : 'orange', 
                                                fontWeight: 'bold',
                                                background: inv.status === 'Lunas' ? '#e9f7ef' : '#fff3cd',
                                                padding: '5px 10px',
                                                borderRadius: '5px'
                                            }}>
                                                {inv.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     )}
                </>
            )}
        </div>
    </div>
  );
}