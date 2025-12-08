"use client";

import { motion, PanInfo } from "framer-motion";
import { Trash2, Image as ImageIcon } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  isSold: boolean;
}

interface ProductRowProps {
  product: Product;
  onToggleSold: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProductRow({ product, onToggleSold, onDelete }: ProductRowProps) {
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete(product.id);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSold(product.id);
  };

  return (
    <div style={styles.wrapper}>
      
      {/* Kırmızı Çöp Kutusu Arka Planı */}
      <div style={styles.deleteBackground}>
        <Trash2 style={{color: '#EF4444', width: '24px', height: '24px'}} />
      </div>

      {/* Ürün Kartı */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 0 }} 
        onDragEnd={handleDragEnd}
        dragElastic={0.2}
        whileDrag={{ scale: 1.02 }}
        style={product.isSold ? styles.cardSold : styles.card}
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
              style: 'currency', 
              currency: 'TRY' 
            }).format(product.price || 0)}
          </p>
        </div>

      </motion.div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    position: 'relative',
    marginBottom: '12px',
    overflow: 'hidden'
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FEE2E2',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '24px'
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
    zIndex: 10
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
    opacity: 0.6
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
  }
};