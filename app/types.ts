export interface Product {
  id: string;
  name: string;      // Ürün İsmi
  price: number;     // Fiyat
  description: string; // Detaylar
  
  // Durumlar
  isSold: boolean;   // Satıldı mı?
  isDeleted: boolean; // Çöpte mi?
  
  // Özellikler
  warranty: 'Var' | 'Yok';
  box: 'Var' | 'Yok';
  
  // Görseller
  images: string[]; 
  
  createdAt: Date;
}