// Simulasi Auth sederhana (bisa diganti dengan supabase.auth.signInWithPassword nanti)
export const authService = {
  login: async (username, role) => {
    // Di real app, ini akan hit Supabase Auth
    // Untuk sekarang kita mock behavior sesuai kode lama tapi terstruktur
    return new Promise((resolve) => {
      setTimeout(() => {
        let userData = { name: '', role: role, id: 'user-123' };
        if (role === 'admin') userData.name = "Admin MAPA";
        if (role === 'guru') userData.name = "Bpk. Guru Budi";
        if (role === 'siswa') userData.name = "Andi Siswa";
        
        localStorage.setItem('user_session', JSON.stringify(userData));
        resolve(userData);
      }, 500);
    });
  },

  logout: async () => {
    localStorage.removeItem('user_session');
    return true;
  },

  getSession: () => {
    const session = localStorage.getItem('user_session');
    return session ? JSON.parse(session) : null;
  }
};