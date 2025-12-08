"use client";
import React, { useEffect, useState, use } from 'react';
import { db, storage } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiShare2, FiX, FiEdit3, FiCheck, FiCamera, FiImage, FiTrash2 } from "react-icons/fi";

// --- TAM EKRAN RESİM MODALI ---
const FullScreenModal = ({ imgUrl, onClose }: { imgUrl: string, onClose: () => void }) => (
  <div style={styles.modalOverlay} onClick={onClose}>
    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <img src={imgUrl} alt="Full Screen" style={styles.fullScreenImage} />
      <button onClick={onClose} style={styles.modalCloseButton}><FiX /></button>
    </div>
  </div>
);

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // --- STATE ---
  const [urun, setUrun] = useState<any>(null);
  const [seciliResim, setSeciliResim] = useState<string | null>(null);
  const [tamEkranResim, setTamEkranResim] = useState<string | null>(null);
  const [paylasildi, setPaylasildi] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Edit State'leri
  const [editModu, setEditModu] = useState(false);
  const [yeniAd, setYeniAd] = useState("");
  const [yeniFiyat, setYeniFiyat] = useState("");
  const [yeniKutu, setYeniKutu] = useState("Yok");
  const [yeniGaranti, setYeniGaranti] = useState("Yok");
  const [yeniAciklama, setYeniAciklama] = useState("");
  const [guncelleniyor, setGuncelleniyor] = useState(false);

  // Fotoğraf düzenleme state'leri
  const [mevcutResimler, setMevcutResimler] = useState<string[]>([]);
  const [yeniDosyalar, setYeniDosyalar] = useState<File[]>([]);
  const [silinecekResimler, setSilinecekResimler] = useState<string[]>([]);

  useEffect(() => {
    const adminCheck = localStorage.getItem('isAdmin');
    if (adminCheck === 'true') {
      setIsAdmin(true);
    }
    if (id) {
      veriyiGetir();
    }
  }, [id]);

const veriyiGetir = () => {
  const docRef = doc(db, "products", id);
  getDoc(docRef).then((docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      setUrun(data);
      
      setYeniAd(data.name);
      setYeniFiyat(data.price.toString());
      setYeniKutu(data.boxStatus);
      setYeniGaranti(data.warrantyStatus);
      setYeniAciklama(data.description || "");
      setMevcutResimler(data.imageUrls || []);

      if (data.imageUrls && data.imageUrls.length > 0) {
        setSeciliResim(data.imageUrls[0]);
      }
    } else {
      // ✅ BURASI YENİ - Ürün yoksa ana sayfaya yönlendir
      alert("Ürün bulunamadı. Ana sayfaya yönlendiriliyorsunuz.");
      router.push('/add');
    }
  }).catch((error) => {
    // ✅ BURASI DA YENİ - Hata varsa ana sayfaya yönlendir
    console.error("Veri çekme hatası:", error);
    alert("Bir hata oluştu.");
    router.push('/add');
  });
};

  const handleDosyaSec = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const yeniDosyalarArray = Array.from(e.target.files);
      setYeniDosyalar((prev) => [...prev, ...yeniDosyalarArray]);
    }
  };

  const handleResmiSil = (resimUrl: string) => {
    // Mevcut resimlerden çıkar
    setMevcutResimler((prev) => prev.filter((url) => url !== resimUrl));
    // Silinecekler listesine ekle
    setSilinecekResimler((prev) => [...prev, resimUrl]);
  };

  const handleYeniDosyayiSil = (index: number) => {
    setYeniDosyalar((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    if(!yeniAd || !yeniFiyat) return alert("Hata: Bilgiler boş olamaz.");
    setGuncelleniyor(true);
    try {
      // 1. Yeni resimleri yükle
      const yuklenenResimler: string[] = [];
      for (const dosya of yeniDosyalar) {
        const storageRef = ref(storage, `urunler/${Date.now()}_${dosya.name}`);
        await uploadBytes(storageRef, dosya);
        const url = await getDownloadURL(storageRef);
        yuklenenResimler.push(url);
      }

      // 2. Silinecek resimleri Firebase Storage'dan sil (opsiyonel)
      // Not: Firebase Storage'dan silmek için resim path'ine ihtiyacınız var
      // Şimdilik sadece Firestore'dan kaldırıyoruz

      // 3. Tüm resimleri birleştir (mevcut + yeni yüklenenler)
      const tumResimler = [...mevcutResimler, ...yuklenenResimler];

      // 4. Firestore'u güncelle
      const docRef = doc(db, "products", id);
      await updateDoc(docRef, {
        name: yeniAd,
        price: Number(yeniFiyat),
        boxStatus: yeniKutu,
        warrantyStatus: yeniGaranti,
        description: yeniAciklama,
        imageUrls: tumResimler
      });

      alert("✅ Güncellendi!");
      setEditModu(false);
      setYeniDosyalar([]);
      setSilinecekResimler([]);
      veriyiGetir();
    } catch (error) {
      console.error(error);
      alert("Hata oluştu.");
    } finally {
      setGuncelleniyor(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Raf Ürün',
          text: `${urun.name} - ${urun.price}₺`,
          url: window.location.href
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setPaylasildi(true);
      setTimeout(() => setPaylasildi(false), 2000);
    }
  };

  if (!urun) return <div style={{padding: 20}}>Yükleniyor...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => router.back()} style={styles.iconButton}>
          <FiArrowLeft style={{fontSize: 24}} />
        </button>
        <h1 style={styles.headerTitle}>Raf</h1>
        {isAdmin && (
          <button onClick={() => setEditModu(true)} style={styles.editButton}>
            <FiEdit3 size={18} /> Düzenle
          </button>
        )}
      </div>

      <div style={styles.card}>
        <div style={styles.imageSection}>
          <div style={styles.mainImageWrapper} onClick={() => setTamEkranResim(seciliResim)}>
             {seciliResim ? <img src={seciliResim} style={styles.mainImage} /> : <div style={{color:'#ccc'}}>Resim Yok</div>}
          </div>
          <div style={styles.thumbnailList}>
            {urun.imageUrls && Array.isArray(urun.imageUrls) && urun.imageUrls.map((img: string, index: number) => (
              <div key={index} style={{...styles.thumbnail, border: seciliResim === img ? '2px solid #2563EB' : '1px solid #eee'}} onClick={() => setSeciliResim(img)}>
                <img src={img} style={{width:'100%', height:'100%', objectFit:'cover'}} />
              </div>
            ))}
          </div>
        </div>

        <div style={styles.infoSection}>
          <h2 style={styles.title}>{urun.name}</h2>
          <div style={styles.priceBox}>{urun.price}₺</div>
          <div style={styles.specList}>
            <div style={styles.specRow}><span>Durum:</span> <span style={styles.specValue}>Sıfır</span></div>
            <div style={styles.specRow}><span>Kutu:</span> <span style={styles.specValue}>{urun.boxStatus}</span></div>
            <div style={styles.specRow}><span>Garanti:</span> <span style={styles.specValue}>{urun.warrantyStatus}</span></div>
          </div>
          <div style={styles.descSection}>
            <h3 style={styles.descTitle}>Açıklama</h3>
            <p style={styles.descText}>{urun.description || "Açıklama yok."}</p>
          </div>
          <button onClick={handleShare} style={styles.shareBigButton}>
            {paylasildi ? <><FiCheck size={20}/> Link Kopyalandı!</> : <><FiShare2 size={20}/> Paylaş</>}
          </button>
        </div>
      </div>

      {editModu && (
        <div style={styles.modalOverlay}>
          <div style={styles.editCard}>
            <div style={styles.modalHeader}>
              <h3 style={{margin:0}}>Düzenle</h3>
              <button onClick={() => setEditModu(false)} style={{background:'none', border:'none', fontSize:24, cursor:'pointer'}}><FiX/></button>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Ürün Adı</label>
              <input type="text" value={yeniAd} onChange={e => setYeniAd(e.target.value)} style={styles.input} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Fiyat (TL)</label>
              <input type="number" value={yeniFiyat} onChange={e => setYeniFiyat(e.target.value)} style={styles.input} />
            </div>

            <div style={{display:'flex', gap:10}}>
               <div style={{flex:1}}>
                  <label style={styles.label}>Kutu</label>
                  <select value={yeniKutu} onChange={e => setYeniKutu(e.target.value)} style={styles.select}>
                    <option value="Yok">Yok</option>
                    <option value="Var">Var</option>
                  </select>
               </div>
               <div style={{flex:1}}>
                  <label style={styles.label}>Garanti</label>
                  <select value={yeniGaranti} onChange={e => setYeniGaranti(e.target.value)} style={styles.select}>
                    <option value="Yok">Yok</option>
                    <option value="Var">Var</option>
                  </select>
               </div>
            </div>

            {/* FOTOĞRAF BÖLÜMÜ */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Fotoğraflar</label>
              
              {/* Mevcut Resimler */}
              {mevcutResimler.length > 0 && (
                <div style={styles.photoGrid}>
                  {mevcutResimler.map((url, index) => (
                    <div key={index} style={styles.photoItem}>
                      <img src={url} style={styles.photoPreview} />
                      <button 
                        onClick={() => handleResmiSil(url)} 
                        style={styles.photoDeleteBtn}
                        type="button"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Yeni Eklenen Dosyalar (Preview) */}
              {yeniDosyalar.length > 0 && (
                <div style={styles.photoGrid}>
                  {yeniDosyalar.map((file, index) => (
                    <div key={index} style={styles.photoItem}>
                      <img 
                        src={URL.createObjectURL(file)} 
                        style={styles.photoPreview} 
                      />
                      <button 
                        onClick={() => handleYeniDosyayiSil(index)} 
                        style={styles.photoDeleteBtn}
                        type="button"
                      >
                        <FiTrash2 size={14} />
                      </button>
                      <div style={styles.newBadge}>YENİ</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Fotoğraf Ekleme Butonları */}
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <label style={styles.uploadBtn}>
                  <FiImage size={20} />
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
                  <FiCamera size={20} />
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
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Açıklama</label>
              <textarea value={yeniAciklama} onChange={e => setYeniAciklama(e.target.value)} style={styles.textarea} />
            </div>

            <button onClick={handleUpdate} disabled={guncelleniyor} style={styles.saveButton}>
              {guncelleniyor ? "Kaydediliyor..." : "GÜNCELLE"}
            </button>
          </div>
        </div>
      )}

      {tamEkranResim && <FullScreenModal imgUrl={tamEkranResim} onClose={() => setTamEkranResim(null)} />}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { minHeight: '100vh', backgroundColor: '#F9FAFB', padding: '15px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  header: { width: '100%', maxWidth: '500px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  iconButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#1F2937' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#2563EB' },
  editButton: { display: 'flex', alignItems: 'center', gap: 5, backgroundColor: '#EFF6FF', color: '#2563EB', border: 'none', padding: '8px 12px', borderRadius: '20px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' },
  card: { width: '100%', maxWidth: '500px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB', padding: '20px', display: 'flex', flexDirection: 'column' },
  imageSection: { marginBottom: '20px' },
  mainImageWrapper: { width: '100%', aspectRatio: '1/1', backgroundColor: '#F3F4F6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '10px', cursor: 'zoom-in' },
  mainImage: { width: '100%', height: '100%', objectFit: 'contain' },
  thumbnailList: { display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' },
  thumbnail: { width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 },
  infoSection: { width: '100%' },
  title: { fontSize: '22px', fontWeight: 'bold', color: '#111', margin: '0 0 15px 0' },
  priceBox: { width: '100%', backgroundColor: '#2563EB', color: 'white', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', padding: '12px', borderRadius: '8px', marginBottom: '20px' },
  specList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' },
  specRow: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px', fontSize: '15px', color: '#555' },
  specValue: { fontWeight: '600', color: '#111' },
  descSection: { marginBottom: '30px' },
  descTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#111' },
  descText: { fontSize: '14px', lineHeight: '1.5', color: '#4B5563', whiteSpace: 'pre-wrap' },
  shareBigButton: { width: '100%', backgroundColor: '#10B981', color: 'white', border: 'none', padding: '15px', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modalContent: { position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  fullScreenImage: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
  modalCloseButton: { position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', fontSize: '30px', cursor: 'pointer' },
  editCard: { backgroundColor: 'white', width: '90%', maxWidth: '400px', padding: '20px', borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: 10 },
  formGroup: { marginBottom: 15 },
  label: { display: 'block', fontSize: 13, fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: 14, backgroundColor: 'white' },
  textarea: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box', minHeight: 80, fontFamily: 'sans-serif' },
  saveButton: { width: '100%', padding: '12px', backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontSize: 16, fontWeight: 'bold', cursor: 'pointer', marginTop: 10 },
  photoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' },
  photoItem: { position: 'relative', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E5E7EB' },
  photoPreview: { width: '100%', height: '100%', objectFit: 'cover' },
  photoDeleteBtn: { position: 'absolute', top: '5px', right: '5px', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  newBadge: { position: 'absolute', bottom: '5px', left: '5px', backgroundColor: '#10B981', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' },
  uploadBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', border: '1px dashed #ddd', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#F9FAFB', color: '#6B7280' }
};