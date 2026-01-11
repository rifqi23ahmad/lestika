import React, { useState, useEffect, useMemo } from "react";
import { Card, Row, Col, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { Trophy, Medal, Crown, User, RefreshCw, Zap, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

// --- CUSTOM STYLES ---
const styles = {
  sectionTitle: {
    background: "linear-gradient(90deg, #1e3a8a, #3b82f6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "800",
    letterSpacing: "-0.5px"
  },
  // Efek Kartu Juara 1 (Emas & Glass)
  cardWinner1: {
    background: "linear-gradient(180deg, #ffffff 0%, #fffbeb 100%)", // Putih ke Emas muda
    border: "2px solid #fcd34d", // Border Emas
    boxShadow: "0 20px 50px -12px rgba(251, 191, 36, 0.5)", // Shadow Emas Pendar
    transform: "scale(1.05) translateY(-10px)",
    zIndex: 10,
    position: "relative",
    overflow: "hidden"
  },
  // Efek Kartu Juara 2 & 3 (Putih Bersih)
  cardWinnerOther: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.05)",
    zIndex: 1
  },
  // Warna Cincin Avatar
  ringGold: "4px solid #f59e0b",
  ringSilver: "4px solid #94a3b8",
  ringBronze: "4px solid #b45309",
  
  // Gaya List Item (Rank 4+)
  listItem: {
    transition: "all 0.2s ease",
    borderLeft: "4px solid transparent",
  },
  listItemHover: {
    transform: "translateX(5px)",
  }
};

export default function LeaderboardSection() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [filterJenjang, setFilterJenjang] = useState("ALL");

  useEffect(() => {
    fetchDataHybrid();
  }, [user]);

  const fetchDataHybrid = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Ambil Data Global (RPC)
      let globalData = [];
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_leaderboard");

      if (rpcError) {
        // Fallback: ambil data manual jika RPC belum siap
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, jenjang, avatar_url, role")
          .eq('role', 'siswa')
          .limit(50); // Ambil lebih banyak untuk list
        if (profiles) globalData = profiles.map(p => ({ ...p, total_score: 0 }));
      } else {
        globalData = rpcData || [];
      }

      // 2. Ambil Data Diri Sendiri (Lokal)
      let myTotalScore = 0;
      let myProfile = null;

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, jenjang, avatar_url, role")
          .eq("id", user.id)
          .single();
        myProfile = profile;

        const { data: attempts } = await supabase
          .from("student_attempts")
          .select("score")
          .eq("student_id", user.id);

        if (attempts) {
          myTotalScore = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
        }
      }

      // 3. Gabungkan Data (Merge)
      let mergedData = [...globalData];
      const isStudent = myProfile && (myProfile.role === 'siswa' || !myProfile.role) && myProfile.role !== 'guru' && myProfile.role !== 'admin';

      if (user && isStudent) {
        const myIndex = mergedData.findIndex((l) => l.id === user.id);
        if (myIndex !== -1) {
          mergedData[myIndex] = {
            ...mergedData[myIndex],
            full_name: myProfile.full_name,
            total_score: Math.max(mergedData[myIndex].total_score || 0, myTotalScore)
          };
        } else {
          mergedData.push({
            id: myProfile.id,
            full_name: myProfile.full_name,
            avatar_url: myProfile.avatar_url,
            jenjang: myProfile.jenjang,
            total_score: myTotalScore,
          });
        }
      }

      // 4. Urutkan berdasarkan Skor
      const uniqueData = Array.from(new Map(mergedData.map(item => [item.id, item])).values());
      uniqueData.sort((a, b) => (b.total_score || 0) - (a.total_score || 0));

      setLeaders(uniqueData);
    } catch (error) {
      console.error("Leaderboard Error:", error);
      setErrorMsg("Gagal memuat data peringkat.");
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaders = useMemo(() => {
    let data = leaders;
    if (filterJenjang !== "ALL") {
      data = leaders.filter((l) => l.jenjang?.toUpperCase() === filterJenjang);
    }
    return data.map((item, index) => ({ ...item, rank: index + 1 }));
  }, [leaders, filterJenjang]);

  const topThree = filteredLeaders.slice(0, 3);
  const restList = filteredLeaders.slice(3); // Rank 4 ke bawah

  if (loading) {
    return (
      <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light">
        <Spinner animation="grow" variant="primary" role="status" size="sm" />
        <p className="mt-3 text-muted small fw-bold text-uppercase ls-1">Memuat Data...</p>
      </div>
    );
  }

  return (
    <div className="py-5 animate-fade-in position-relative">
      
      {/* Background Decor */}
      <div className="position-absolute top-0 start-50 translate-middle-x w-100 h-100 pe-none" style={{
          background: "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.03) 0%, transparent 70%)",
          zIndex: -1
      }}></div>

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-4">
        <div className="text-center text-md-start">
          <h3 className="mb-2 d-flex align-items-center justify-content-center justify-content-md-start gap-2" style={styles.sectionTitle}>
            <Trophy className="text-warning" size={32} fill="#fbbf24" /> 
            Papan Peringkat
          </h3>
          <p className="text-muted mb-0 small">
            Siswa dengan total poin tertinggi dari seluruh latihan
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white p-1 rounded-pill shadow-sm border d-flex align-items-center">
          {["ALL", "SD", "SMP", "SMA"].map((f) => (
            <Button
              key={f}
              variant={filterJenjang === f ? "dark" : "light"}
              className={`rounded-pill px-4 py-1 border-0 small fw-bold transition-all ${
                filterJenjang !== f ? "bg-transparent text-muted" : "shadow"
              }`}
              onClick={() => setFilterJenjang(f)}
            >
              {f === "ALL" ? "Semua" : f}
            </Button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <Alert variant="danger" className="text-center mb-4 border-0 shadow-sm rounded-4">
            {errorMsg} <Button variant="link" size="sm" onClick={fetchDataHybrid}>Coba Lagi</Button>
        </Alert>
      )}

      {/* --- PODIUM (TOP 3) --- */}
      {topThree.length > 0 ? (
        <Row className="g-3 mb-5 justify-content-center align-items-end px-2">
          {/* Juara 2 */}
          {topThree[1] && (
            <Col xs={4} md={3} className="order-1 order-md-0">
              <PodiumCard data={topThree[1]} rank={2} />
            </Col>
          )}
          {/* Juara 1 */}
          {topThree[0] && (
            <Col xs={4} md={4} className="order-0 order-md-1 pb-4">
               <PodiumCard data={topThree[0]} rank={1} isFirst />
            </Col>
          )}
          {/* Juara 3 */}
          {topThree[2] && (
            <Col xs={4} md={3} className="order-2 order-md-2">
              <PodiumCard data={topThree[2]} rank={3} />
            </Col>
          )}
        </Row>
      ) : (
        <div className="text-center py-5 bg-light rounded-4 mb-4 border border-dashed">
           <p className="text-muted">Belum ada data peringkat.</p>
        </div>
      )}

      {/* --- DAFTAR PERINGKAT SELANJUTNYA (RANK 4+) --- */}
      {restList.length > 0 && (
        <div className="d-flex flex-column gap-2 mt-4 px-1">
            <div className="d-flex justify-content-between align-items-center mb-2 px-2">
                <h6 className="text-muted fw-bold small text-uppercase ls-1 mb-0">Peringkat Lainnya</h6>
                <span className="badge bg-light text-secondary border rounded-pill">{restList.length} Siswa</span>
            </div>
            
            {restList.map((item) => {
               const isMe = item.id === user?.id;
               return (
                <div 
                  key={item.id}
                  className={`d-flex align-items-center bg-white p-3 rounded-4 shadow-sm position-relative overflow-hidden transition-all ${isMe ? "border-primary bg-primary bg-opacity-10" : "border-white"}`}
                  style={{
                      ...styles.listItem, 
                      border: isMe ? "1px solid #3b82f6" : "1px solid #f3f4f6"
                  }}
                >
                    {/* Rank Number */}
                    <div className="me-3 text-center" style={{minWidth: 40}}>
                        <span className="fw-bold text-secondary font-monospace">#{item.rank}</span>
                    </div>

                    {/* Avatar */}
                    <div className="me-3">
                        <img 
                            src={item.avatar_url || `https://ui-avatars.com/api/?name=${item.full_name}&background=random`} 
                            alt="" 
                            className="rounded-circle object-fit-cover shadow-sm"
                            style={{width: 42, height: 42}}
                        />
                    </div>

                    {/* Name & Badge */}
                    <div className="flex-grow-1 min-w-0">
                        <div className="d-flex align-items-center gap-2">
                             <h6 className="mb-0 fw-bold text-dark text-truncate">
                                {item.full_name}
                            </h6>
                            {isMe && <Badge bg="primary" className="rounded-pill" style={{fontSize: '0.6rem'}}>Kamu</Badge>}
                        </div>
                        <small className="text-muted">{item.jenjang || "Siswa"}</small>
                    </div>

                    {/* Score */}
                    <div className="text-end ps-2">
                        <div className="fw-bolder text-dark d-flex align-items-center justify-content-end gap-1">
                            <Zap size={16} className="text-warning" fill="currentColor"/>
                            {Math.round(item.total_score).toLocaleString("id-ID")}
                        </div>
                        <small className="text-muted" style={{fontSize: '0.7rem'}}>Poin</small>
                    </div>
                </div>
               )
            })}
        </div>
      )}

      {/* Jika hanya ada top 3 (tidak ada rank 4+) */}
      {restList.length === 0 && topThree.length > 0 && (
          <div className="text-center py-4 text-muted small opacity-75">
             ~ Menampilkan {topThree.length} Juara Terbaik ~
          </div>
      )}

    </div>
  );
}

// --- KOMPONEN KARTU PODIUM ---
function PodiumCard({ data, rank, isFirst }) {
  let ringStyle = styles.ringBronze;
  let MedalIcon = Medal;
  let iconColor = "#b45309"; 
  
  if (rank === 1) {
    ringStyle = styles.ringGold;
    MedalIcon = Crown;
    iconColor = "#f59e0b"; 
  } else if (rank === 2) {
    ringStyle = styles.ringSilver;
    iconColor = "#94a3b8"; 
  }

  return (
    <Card className="text-center rounded-5" style={isFirst ? styles.cardWinner1 : styles.cardWinnerOther}>
        {isFirst && (
            <div className="position-absolute top-0 start-0 w-100 h-100 pe-none" style={{overflow:'hidden'}}>
                 <div className="position-absolute top-0 end-0 p-3 opacity-25">
                     <Sparkles className="text-warning" size={32}/>
                 </div>
                 <div className="position-absolute bottom-0 start-0 w-100 h-50 bg-gradient-to-t from-yellow-50 to-transparent opacity-50"></div>
            </div>
        )}

      <Card.Body className={`p-3 d-flex flex-column align-items-center ${isFirst ? 'pt-4 pb-4' : ''}`}>
        <div className="position-relative mb-3">
          <div
            className="rounded-circle shadow-sm"
            style={{
              width: isFirst ? 80 : 60,
              height: isFirst ? 80 : 60,
              border: ringStyle,
              padding: 3,
              background: '#fff'
            }}
          >
            <img
                src={data.avatar_url || `https://ui-avatars.com/api/?name=${data.full_name}&background=random`}
                alt={data.full_name}
                className="w-100 h-100 rounded-circle object-fit-cover"
            />
          </div>
          <div 
            className="position-absolute start-50 translate-middle-x bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center"
            style={{
                width: isFirst ? 32 : 24, 
                height: isFirst ? 32 : 24, 
                bottom: -10,
                border: '1px solid #f3f4f6'
            }}
          >
            <MedalIcon size={isFirst ? 18 : 14} fill={iconColor} color={iconColor} />
          </div>
        </div>

        <div className="mt-2 w-100 px-1 position-relative" style={{zIndex: 2}}>
          <h6 className={`fw-bold text-dark text-truncate mb-1 ${isFirst ? 'fs-6' : 'small'}`}>
            {data.full_name}
          </h6>
          <div className="d-flex align-items-center justify-content-center gap-1">
             <Badge bg={isFirst ? "warning" : "light"} text={isFirst ? "dark" : "secondary"} className={`rounded-pill fw-normal ${isFirst ? "bg-opacity-25 text-warning border border-warning" : "border"}`}>
                {data.jenjang || "Siswa"}
             </Badge>
          </div>
          <div className={`mt-2 fw-bolder ${isFirst ? 'text-dark fs-5' : 'text-secondary small'}`}>
             {Math.round(data.total_score).toLocaleString("id-ID")} <span className="fw-normal small text-muted">pts</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}