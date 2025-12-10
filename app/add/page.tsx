"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiLogOut, FiBox, FiX, FiCamera, FiImage, FiTrash2 } from "react-icons/fi";
import ProductRow from '../components/ProductRow';

// Firebase bağlantıları
import { storage, db } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, orderBy, query, where, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrls: string[];
  boxStatus: string;
  warrantyStatus: string;
  description: string;
  isSold: boolean;
  shortCode?: string;
  createdAt: any;
}

export default function AdminDashboard() {
  const router = useRouter();

  // --- STATE ---
  const [modalAcik, setModalAcik] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [urunler, setUrunler] = useState<Product[]>([]);
  const [silinenUrunler, setSilinenUrunler] = useState<Product[]>([]);
  const [aramaMetni, setAramaMetni] = useState("");
  const [copKutusuAcik, setCopKutusuAcik] = useState(false);
  
  // Form Bilgileri
  const [urunAdi, setUrunAdi] = useState("");
  const [fiyat, setFiyat] = useState("");
  const [kutuDurumu, setKutuDurumu] = useState("Yok");
  const [garantiDurumu, setGarantiDurumu] = useState("Yok");
  const [aciklama, setAciklama] = useState(""); 
  
  const [secilenDosyalar, setSecilenDosyalar] = useState<File[]>([]);

  useEffect(() => {
    verileriGetir();
  }, []);

  const verileriGetir = async () => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const veriListesi: Product[] = [];
    const silinenListe: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const urun = { 
        id: doc.id, 
        isSold: false,
        shortCode: data.shortCode || '',
        ...data 
      } as Product;
      
      if (data.deleted) {
        silinenListe.push(urun);
      } else {
        veriListesi.push(urun);
      }
    });
    setUrunler(veriListesi);
    setSilinenUrunler(silinenListe);
  };

  const handleDosyaSec = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const yeniDosyalar = Array.from(e.target.files);
      setSecilenDosyalar((eskiler) => [...eskiler, ...yeniDosyalar]);
    }
  };

  const handleKaydet = async () => {
    if (!urunAdi || !fiyat || secilenDosyalar.length === 0) return alert("Lütfen zorunlu alanları doldur ve resim seç!");

    setYukleniyor(true);
    try {
      const yuklenenResimLinkleri: string[] = [];

      for (const dosya of secilenDosyalar) {
        const storageRef = ref(storage, `urunler/${Date.now()}_${dosya.name}`);
        await uploadBytes(storageRef, dosya);
        const url = await getDownloadURL(storageRef);
        yuklenenResimLinkleri.push(url);
      }

      // ✅ GELIŞMIŞ KISA KOD OLUŞTUR (Benzersiz 6 karakter)
      const generateShortCode = (): string => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // I,O,0,1 yok (karışıklık olmasın)
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      // Benzersiz kod oluştur (varsa yeniden dene)
      let shortCode = generateShortCode();
      let isUnique = false;
      
      while (!isUnique) {
        const q = query(collection(db, "products"), where("shortCode", "==", shortCode));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          isUnique = true;
        } else {
          shortCode = generateShortCode();
        }
      }

      await addDoc(collection(db, "products"), {
        name: urunAdi,
        price: Number(fiyat),
        boxStatus: kutuDurumu,
        warrantyStatus: garantiDurumu,
        description: aciklama,
        imageUrls: yuklenenResimLinkleri,
        isSold: false,
        createdAt: serverTimestamp(),
        shortCode: shortCode
      });

      alert("✅ Ürün Başarıyla Eklendi!");
      setModalAcik(false);
      verileriGetir();
      
      // Temizlik
      setUrunAdi("");
      setFiyat("");
      setAciklama("");
      setSecilenDosyalar([]);
      setKutuDurumu("Yok");
      setGarantiDurumu("Yok");

    } catch (error) {
      console.error("Hata:", error);
      alert("Hata oluştu.");
    } finally {
      setYukleniyor(false);
    }
  };

  // CHECKBOX - SATILDI İŞARETLEME
  const handleToggleSold = async (id: string) => {
    const urun = urunler.find(u => u.id === id);
    if (!urun) return;

    try {
      await updateDoc(doc(db, "products", id), {
        isSold: !urun.isSold
      });
      verileriGetir();
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      alert("İşaretlenirken hata oluştu.");
    }
  };

  // SWIPE DELETE (Soft Delete - Çöp Kutusuna Gönder)
  const handleSil = async (id: string) => {
    try {
      await updateDoc(doc(db, "products", id), {
        deleted: true,
        deletedAt: serverTimestamp()
      });
      verileriGetir();
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Silinirken hata oluştu.");
    }
  };

  // SİLİNEN ÜRÜNÜ GERİ GETİR
  const handleGeriGetir = async (id: string) => {
    try {
      await updateDoc(doc(db, "products", id), {
        deleted: false,
        deletedAt: null
      });
      verileriGetir();
    } catch (error) {
      console.error("Geri getirme hatası:", error);
      alert("Geri getirirken hata oluştu.");
    }
  };

const kartaGit = (shortCode?: string) => {
  if (shortCode) {
    router.push(`/${shortCode}`);
  }
};

  // FİLTRELEME VE SIRALAMA
  const filtrelenmisUrunler = urunler
    .filter(urun => urun.name.toLowerCase().includes(aramaMetni.toLowerCase()))
    .sort((a, b) => {
      if (a.isSold === b.isSold) return 0;
      return a.isSold ? 1 : -1;
    });

  // SAYAÇLAR
  const toplamUrun = urunler.length;
  const raftakiUrun = urunler.filter(u => !u.isSold).length;
  const satilanUrun = urunler.filter(u => u.isSold).length;

  // Formatlama fonksiyonu (3.433 formatı)
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoContainer}>
            <img src="/logo_raf.png" alt="Logo" style={styles.headerLogo} />
            <h1 style={styles.brandTitle}>STOK</h1>
          </div>
          <button 
            onClick={() => {
              sessionStorage.clear();
              window.location.href = '/';
            }}
            style={styles.iconButton}
          >
            <FiLogOut size={24} />
          </button>
        </div>
        <div style={styles.statsContainer}>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>{formatNumber(toplamUrun)}</span>
            <span style={styles.statLabel}>TOPLAM</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>{formatNumber(raftakiUrun)}</span>
            <span style={styles.statLabel}>RAFTA</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>{formatNumber(satilanUrun)}</span>
            <span style={styles.statLabel}>SATILDI</span>
          </div>
        </div>
      </div>

      {/* SEARCH & BUTTON */}
      <div style={styles.actionRow}>
        <div style={styles.searchWrapper}>
             <FiSearch style={{marginLeft: '15px', color: '#999'}} />
             <input 
               type="text" 
               placeholder="Ürün ara..." 
               style={styles.searchInput}
               value={aramaMetni}
               onChange={(e) => setAramaMetni(e.target.value)}
             />
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
          {silinenUrunler.length > 0 && (
            <button 
              onClick={() => setCopKutusuAcik(!copKutusuAcik)} 
              style={{
                ...styles.addButton,
                backgroundColor: copKutusuAcik ? '#EF4444' : '#6B7280'
              }}
            >
              <FiTrash2 size={18} /> {silinenUrunler.length}
            </button>
          )}
          <button onClick={() => setModalAcik(true)} style={styles.addButton}>
            + Ürün Ekle
          </button>
        </div>
      </div>

      {/* LISTE - PRODUCTROW COMPONENT KULLANIMI */}
      <div style={styles.contentArea}>
         {filtrelenmisUrunler.length === 0 ? (
           <div style={styles.emptyState}>
              <FiBox style={{fontSize: '50px', color: '#ccc', marginBottom: '15px'}} />
              <p style={{color: '#999'}}>
                {aramaMetni ? "Aradığınız ürün bulunamadı." : "Henüz ürün eklenmedi."}
              </p>
           </div>
         ) : (
           <div style={styles.listContainer}>
             {filtrelenmisUrunler.map((urun) => (
              <div key={urun.id} onClick={() => kartaGit(urun.shortCode || urun.id)} style={{cursor: 'pointer'}}>
                 <ProductRow 
                   product={{
                     id: urun.id,
                     name: urun.name,
                     price: urun.price,
                     images: urun.imageUrls || [],
                     isSold: urun.isSold,
                     shortCode: urun.shortCode || urun.id
                   }}
                   onToggleSold={handleToggleSold}
                   onDelete={handleSil}
                 />
               </div>
             ))}
           </div>
         )}
      </div>

      {/* ÇÖP KUTUSU - SİLİNEN ÜRÜNLER */}
      {copKutusuAcik && silinenUrunler.length > 0 && (
        <div style={styles.copKutusuSection}>
          <div style={styles.copKutusuHeader}>
            <h3 style={styles.copKutusuTitle}>Çöp Kutusu ({silinenUrunler.length})</h3>
            <button onClick={() => setCopKutusuAcik(false)} style={styles.closeButton}>
              <FiX />
            </button>
          </div>
          <div style={styles.listContainer}>
            {silinenUrunler.map((urun) => (
              <div key={urun.id} style={styles.copKutusuItem}>
                <div style={styles.copKutusuItemContent}>
                  {urun.imageUrls && urun.imageUrls.length > 0 && (
                    <img src={urun.imageUrls[0]} alt={urun.name} style={styles.copKutusuImage} />
                  )}
                  <div style={{flex: 1}}>
                    <h4 style={styles.copKutusuItemName}>{urun.name}</h4>
                    <p style={styles.copKutusuItemPrice}>
                      {new Intl.NumberFormat('tr-TR', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(urun.price || 0)}₺
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleGeriGetir(urun.id)} 
                  style={styles.geriGetirButton}
                >
                  Geri Getir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL */}
      {modalAcik && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2 style={{margin: 0, fontSize: '18px'}}>Yeni Ürün Ekle</h2>
              <button onClick={() => setModalAcik(false)} style={styles.closeButton}><FiX /></button>
            </div>

            <div style={styles.modalBody}>
              <input 
                type="text" 
                value={urunAdi} 
                onChange={(e) => setUrunAdi(e.target.value)} 
                style={styles.input} 
                placeholder="Ürün Adı" 
              />
              <input 
                type="number" 
                value={fiyat} 
                onChange={(e) => setFiyat(e.target.value)} 
                style={styles.input} 
                placeholder="Fiyat (TL)" 
              />

              <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                <select 
                  value={kutuDurumu} 
                  onChange={(e) => setKutuDurumu(e.target.value)} 
                  style={styles.selectInput}
                >
                  <option value="Yok">Kutu: Yok</option>
                  <option value="Var">Kutu: Var</option>
                </select>
                <select 
                  value={garantiDurumu} 
                  onChange={(e) => setGarantiDurumu(e.target.value)} 
                  style={styles.selectInput}
                >
                  <option value="Yok">Garanti: Yok</option>
                  <option value="Var">Garanti: Var</option>
                </select>
              </div>

              <label style={styles.label}>Fotoğraflar ({secilenDosyalar.length})</label>
              <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                <label style={styles.uploadBtn}>
                  <FiImage size={24} />
                  <span style={{fontSize: '12px', marginTop: 5}}>Galeri</span>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleDosyaSec} 
                    style={{display: 'none'}} 
                  />
                </label>
                <label style={styles.uploadBtn}>
                  <FiCamera size={24} />
                  <span style={{fontSize: '12px', marginTop: 5}}>Kamera</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    onChange={handleDosyaSec} 
                    style={{display: 'none'}} 
                  />
                </label>
              </div>

              <label style={styles.label}>Açıklama</label>
              <textarea 
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                style={styles.textarea}
                placeholder="Ürün hakkında notlar..."
              />

              <button 
                onClick={handleKaydet} 
                disabled={yukleniyor} 
                style={{
                  ...styles.saveButton, 
                  backgroundColor: yukleniyor ? '#ccc' : '#2563EB'
                }}
              >
                {yukleniyor ? "Yükleniyor..." : "KAYDET"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { 
    minHeight: '100vh', 
    backgroundColor: '#F9FAFB', 
    padding: '20px', 
    fontFamily: 'sans-serif' 
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: '20px' 
  },
  headerLeft: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px' 
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  headerLogo: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    objectFit: 'cover'
  },
  brandTitle: { 
    fontSize: '20px', 
    fontWeight: 'bold', 
    color: '#1F2937', 
    margin: 0 
  },
  iconButton: { 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    fontSize: '20px', 
    color: '#6B7280' 
  },
  statsContainer: { 
    display: 'flex', 
    gap: '15px' 
  },
  statItem: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center' 
  },
  statNumber: { 
    fontSize: '16px', 
    fontWeight: 'bold', 
    color: '#374151' 
  },
  statLabel: { 
    fontSize: '10px', 
    color: '#9CA3AF', 
    marginTop: 2 
  },
  actionRow: { 
    display: 'flex', 
    gap: '10px', 
    marginBottom: '20px' 
  },
  searchWrapper: { 
    flex: 1, 
    backgroundColor: 'white', 
    borderRadius: '8px', 
    border: '1px solid #E5E7EB', 
    display: 'flex', 
    alignItems: 'center' 
  },
  searchInput: { 
    width: '100%', 
    padding: '10px', 
    border: 'none', 
    borderRadius: '8px', 
    outline: 'none', 
    fontSize: '14px' 
  },
  addButton: { 
    backgroundColor: '#2563EB', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    padding: '12px 30px', 
    fontSize: '15px', 
    fontWeight: '600', 
    cursor: 'pointer', 
    whiteSpace: 'nowrap' 
  },
  contentArea: { 
    paddingBottom: 50 
  },
  emptyState: { 
    textAlign: 'center', 
    marginTop: '50px' 
  },
  listContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px' 
  },
  modalOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 1000 
  },
  modalCard: { 
    backgroundColor: 'white', 
    padding: '20px', 
    borderRadius: '12px', 
    width: '90%', 
    maxWidth: '400px', 
    maxHeight: '90vh', 
    overflowY: 'auto' 
  },
  modalHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '20px' 
  },
  closeButton: { 
    background: 'none', 
    border: 'none', 
    fontSize: '20px', 
    cursor: 'pointer' 
  },
  modalBody: { 
    display: 'flex', 
    flexDirection: 'column' 
  },
  label: { 
    fontSize: '13px', 
    fontWeight: '600', 
    marginBottom: '8px', 
    color: '#333' 
  },
  input: { 
    padding: '12px', 
    borderRadius: '8px', 
    border: '1px solid #ddd', 
    marginBottom: '10px', 
    fontSize: '14px', 
    width: '100%', 
    boxSizing: 'border-box' 
  },
  textarea: { 
    padding: '12px', 
    borderRadius: '8px', 
    border: '1px solid #ddd', 
    marginBottom: '15px', 
    fontSize: '14px', 
    width: '100%', 
    boxSizing: 'border-box', 
    minHeight: '80px', 
    fontFamily: 'sans-serif' 
  },
  selectInput: { 
    padding: '10px', 
    borderRadius: '8px', 
    border: '1px solid #ddd', 
    fontSize: '14px', 
    width: '100%', 
    backgroundColor: 'white' 
  },
  saveButton: { 
    padding: '12px', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '16px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    marginTop: '10px' 
  },
  uploadBtn: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '15px', 
    border: '1px solid #ddd', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    backgroundColor: '#F3F4F6', 
    color: '#4B5563' 
  },
  copKutusuSection: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
    border: '1px solid #E5E7EB'
  },
  copKutusuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  copKutusuTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1F2937',
    margin: 0
  },
  copKutusuItem: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '10px',
    border: '1px solid #E5E7EB',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px'
  },
  copKutusuItemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flex: 1
  },
  copKutusuImage: {
    width: '50px',
    height: '50px',
    borderRadius: '6px',
    objectFit: 'cover'
  },
  copKutusuItemName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1F2937',
    margin: '0 0 4px 0'
  },
  copKutusuItemPrice: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0
  },
  geriGetirButton: {
    padding: '8px 16px',
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};
