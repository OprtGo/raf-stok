"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [sifre, setSifre] = useState('');
  const router = useRouter();

  const DOGRU_SIFRE = "123456";

  // Sayfa açılınca eski admin kaydı varsa temizle (Güvenlik için)
  useEffect(() => {
    localStorage.removeItem('isAdmin');
  }, []);

  const handleGiris = () => {
    if (sifre === DOGRU_SIFRE) {
      // Şifre doğruysa "Admin Rozeti" ver
      localStorage.setItem('isAdmin', 'true');
      router.push('/add');
    } else {
      alert("Hatalı şifre! Tekrar dene.");
    }
  };

  return (
    <div style={styles.container}>
      {/* LOGO DAİRESİ */}
      <div style={styles.logoCircle}>
        <img 
          src="/logo_raf.png" 
          alt="Raf Logo" 
          style={styles.logoImage}
        />
      </div>

      <h1 style={styles.mainTitle}>STOK</h1>

      <div style={styles.formWrapper}>
        <input
          type="password"
          maxLength={6}
          placeholder="Password"
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleGiris} style={styles.button}>
          GIRIS
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { 
    height: '100vh', 
    width: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#6ecdf9', 
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
  },
  logoCircle: { 
    width: '100px', 
    height: '100px', 
    backgroundColor: 'white', 
    borderRadius: '50%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: '20px', 
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  logoImage: {
    width: '70px',
    height: '70px',
    objectFit: 'contain'
  },
  mainTitle: { 
    color: 'white', 
    fontSize: '42px', 
    fontWeight: 'bold', 
    marginBottom: '40px', 
    letterSpacing: '1px', 
    margin: '0 0 40px 0' 
  },
  formWrapper: { 
    width: '100%', 
    maxWidth: '320px', 
    display: 'flex', 
    flexDirection: 'column' 
  },
  input: { 
    width: '100%', 
    padding: '15px', 
    fontSize: '16px', 
    border: 'none', 
    backgroundColor: 'white', 
    color: '#333', 
    outline: 'none', 
    textAlign: 'center', 
    boxSizing: 'border-box', 
    marginBottom: '15px', 
    borderRadius: '0' 
  },
  button: { 
    width: '100%', 
    padding: '15px', 
    backgroundColor: 'black', 
    color: 'white', 
    border: 'none', 
    fontSize: '14px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    letterSpacing: '1px', 
    boxSizing: 'border-box', 
    borderRadius: '4px', 
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)' 
  }
};