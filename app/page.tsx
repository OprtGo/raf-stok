"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [sifre, setSifre] = useState('');
  const router = useRouter();
  const DOGRU_SIFRE = "123456";

  // Sayfa açıldığında sessionStorage'daki admin durumunu kontrol et
  useEffect(() => {
    const adminVar = sessionStorage.getItem('isAdmin');
    if (adminVar === 'true') {
      router.replace('/add');
    }
  }, [router]);

  const handleGiris = (e: React.FormEvent) => {
    e.preventDefault();
    if (sifre === DOGRU_SIFRE) {
      sessionStorage.setItem('isAdmin', 'true');
      router.push('/add');
    } else {
      alert("Hatalı şifre! Tekrar dene.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.logoCircle}>
        <img src="/logo_raf.png" alt="Raf Logo" style={styles.logoImage} />
      </div>

      <h1 style={styles.mainTitle}>STOK</h1>

      <form onSubmit={handleGiris} style={styles.formWrapper}>
        <input
          type="password"
          maxLength={6}
          placeholder="Password"
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          style={styles.input}
          autoFocus
        />
        <button type="submit" style={styles.button}>
          GİRİŞ
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { 
    minHeight: '100vh', 
    background: 'linear-gradient(135deg, #00d4ff, #0099cc)', 
    display: 'flex', 
    flexDirection: 'column' as const,
    alignItems: 'center', 
    justifyContent: 'center',
    padding: 20
  },
  logoCircle: { width: 140, height: 140, borderRadius: 70, overflow: 'hidden', marginBottom: 50 },
  logoImage: { width: '100%', height: '100%', objectFit: 'cover' as const },
  mainTitle: { fontSize: 56, fontWeight: 'bold', marginBottom: 80, color: '#fff', letterSpacing: 4 },
  formWrapper: { 
    width: '100%', 
    maxWidth: 360,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center'
  },
  input: { 
    width: '100%',
    maxWidth: 320,
    padding: 22,
    fontSize: 22,
    textAlign: 'center' as const,
    borderRadius: 16,
    border: 'none',
    marginBottom: 24,
    background: 'rgba(255,255,255,0.95)',
    color: '#000'
  },
  button: { 
    width: '100%',
    maxWidth: 320,
    padding: 22,
    fontSize: 26,
    background: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: 16,
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};