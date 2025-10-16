'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

// Tipe data untuk produk
interface Product {
  products_id: number;
  products_name: string;
}

export default function TambahStokPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [updateDate, setUpdateDate] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('products_id, products_name')
        // Filter agar hanya mengambil produk yang tipenya BUKAN 'Milk Tea Fruity'
        .neq('products_type', 'Milk Tea Fruity')
        .order('products_name');
        
      if (!error) setProducts(data);
      else console.error('Error fetching products:', error);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // INI ADALAH FUNGSI YANG KITA PASTIKAN BENAR
  const handleCardClick = (product: Product) => {
    setSelectedProduct(product);
    
    // Kode baru untuk mengambil tanggal DAN waktu lokal saat ini
    const now = new Date();
    // Menyesuaikan dengan zona waktu lokal Anda
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    // Format menjadi YYYY-MM-DDTHH:mm yang diterima oleh input datetime-local
    const formattedDateTime = now.toISOString().slice(0, 16);
    
    setUpdateDate(formattedDateTime);
    setQuantity('');
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const handleStockUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      alert('Jumlah harus diisi dan lebih dari 0.');
      return;
    }

    // UBAH HANYA BARIS INI:
    const isoDate = new Date(updateDate).toISOString();

    const { error } = await supabase.rpc('tambah_stok', {
      product_id_to_update: selectedProduct.products_id,
      quantity_to_add: parseInt(quantity),
      update_date: isoDate, // <-- GUNAKAN isoDate YANG SUDAH BENAR
    });

    if (error) {
      alert('Gagal menambah stok: ' + error.message);
    } else {
      alert(`Stok ${selectedProduct.products_name} berhasil ditambah!`);
      closeModal();
    }
  };

  if (loading) return <main className="container py-5 text-center"><p>Memuat produk...</p></main>;

  return (
    <main className="container py-5">
      <h1 className="text-center mb-4">Pilih Produk untuk Tambah Stok</h1>
      <div className="row row-cols-2 row-cols-md-4 g-3">
        {products.map((product) => (
          <div key={product.products_id} className="col">
            <button 
              className="btn btn-outline-primary w-100 h-100 p-3" 
              onClick={() => handleCardClick(product)}
            >
              {product.products_name}
            </button>
          </div>
        ))}
      </div>
      <div className="text-center mt-4">
        <Link href="/" className="btn btn-link">&larr; Kembali ke Halaman Utama</Link>
      </div>
      {selectedProduct && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Tambah Stok: {selectedProduct.products_name}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <form onSubmit={handleStockUpdate}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="quantity" className="form-label">Jumlah Penambahan</label>
                      <input id="quantity" type="number" className="form-control" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Contoh: 50" autoFocus required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="updateDate" className="form-label">Tanggal Penambahan</label>
                      <input id="updateDate" type="datetime-local" className="form-control" value={updateDate} onChange={(e) => setUpdateDate(e.target.value)} required />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Batal</button>
                    <button type="submit" className="btn btn-primary">Simpan</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}