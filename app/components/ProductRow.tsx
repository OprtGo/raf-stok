"use client";

import React, { useState } from "react";
import { Trash2, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  isSold: boolean;
  shortCode?: string; // ✅ Kısa kod eklendi
}

interface ProductRowProps {
  product: Product;
  onToggleSold: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProductRow({ product, onToggleSold, onDelete }: ProductRowProps) {
  const router = useRouter();
  const [deleteHover, setDeleteHover] = useState(false);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSold(product.id);
  };

  const handleCardClick = () => {
    // shortCode varsa onu kullan, yoksa id'yi kullan
    if (product.shortCode) {
      router.push(`/${product.shortCode}`);
    } else {
      router.push(`/product/${product.id}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Bu ürünü silmek istediğine emin misin?")) {
      onDelete(product.id);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Ürün Kartı */}
      <div
        style={product.isSold ? styles.cardSold : styles.card}
        onClick={handleCardClick}
      >
        
        {/* CHECKBOX */}
        <div style={styles.checkboxWrapper} onClick={handleCheckboxClick}>
          <input 
            type="checkbox" 
            checked={product.isSold} 
            onChange={() => {}}
            style={styles.checkbox}
          />
        </div>

        {/* Resim */}
        <div style={styles.imageContainer}>
          {product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name} 
              style={styles.image}
            />
          ) : (
            <ImageIcon style={{color: '#D1D5DB', width: '24px', height: '24px'}} />
          )}
        </div>

        {/* İsim ve Fiyat */}
        <div style={styles.infoContainer}>
          <h3 style={product.isSold ? styles.productNameSold : styles.productName}>
            {product.name}
          </h3>
          <p style={styles.price}>
            {new Intl.NumberFormat('tr-TR', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(product.price || 0)}₺
          </p>
        </div>

        {/* Çöp Kutusu Butonu - Tüm ürünlerde görünür */}
        <button
          onClick={handleDeleteClick}
          onMouseEnter={() => setDeleteHover(true)}
          onMouseLeave={() => setDeleteHover(false)}
          style={{
            ...styles.deleteButton,
            backgroundColor: deleteHover ? '#F3F4F6' : 'transparent',
            opacity: product.isSold ? 0.5 : 1
          }}
          type="button"
        >
          <Trash2 size={18} />
        </button>

      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    position: 'relative',
    marginBottom: '12px'
  },
  card: {
    position: 'relative',
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #F3F4F6',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    zIndex: 10,
    cursor: 'pointer'
  },
  cardSold: {
    position: 'relative',
    backgroundColor: '#F9FAFB',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    zIndex: 10,
    opacity: 0.6,
    cursor: 'pointer'
  },
  checkboxWrapper: {
    flexShrink: 0,
    cursor: 'pointer'
  },
  checkbox: {
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    accentColor: '#2563EB'
  },
  imageContainer: {
    width: '48px',
    height: '48px',
    backgroundColor: '#F3F4F6',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  infoContainer: {
    flex: 1,
    minWidth: 0
  },
  productName: {
    fontWeight: '600',
    fontSize: '15px',
    color: '#1F2937',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    margin: '0 0 4px 0'
  },
  productNameSold: {
    fontWeight: '600',
    fontSize: '15px',
    color: '#6B7280',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    margin: '0 0 4px 0',
    textDecoration: 'line-through'
  },
  price: {
    fontSize: '14px',
    color: '#2563EB',
    fontWeight: 'bold',
    margin: 0
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000000',
    borderRadius: '6px',
    flexShrink: 0,
    transition: 'background-color 0.2s'
  }
};
