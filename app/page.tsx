"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [sifre, setSifre] = useState('');
  const router = useRouter();
  const DOGRU_SIFRE = "123456";

  // Sayfa açıldığında localStorage’daki admin durumunu koruyalım
  useEffect(() => {
    const adminVar = localStorage.getItem('isAdmin');
    if (adminVar === 'true') {
      router.replace('/add'); // direkt içeri alsın
    }
  }, [router]);

  const handleGiris = (e: React.FormEvent) => {
    e.preventDefault(); // sayfanın yenilenmesini engeller
    if (sifre === DOGRU_SIFRE) {
      localStorage.setItem('isAdmin', 'true');
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
    background: '#000', 
    color: '#fff', 
    display: 'flex', 
    flexDirection: 'column' as const, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  logoCircle: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', marginBottom: 40 },
  logoImage: { width: '100%', height: '100%', objectFit: 'cover' as const },
  mainTitle: { fontSize: 48, fontWeight: 'bold', marginBottom: 60 },
  formWrapper: { width: '80%', maxWidth: 340 },
  input: { 
    width: '100%', 
    padding: 20, 
    fontSize: 24, 
    textAlign: 'center' as const, 
    borderRadius: 12, 
    border: 'none', 
    marginBottom: 20 
  },
  button: { 
    width: '100%', 
    padding: 20, 
    fontSize: 24, 
    background: '#0066ff', 
    color: '#fff', 
    border: 'none', 
    borderRadius: 12, 
    cursor: 'pointer' 
  }
};