'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

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
  
  // State baru untuk menentukan aksi: 'add' (tambah) atau 'remove' (kurang)
  const [actionType, setActionType] = useState<'add' | 'remove' | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('products_id, products_name')
        // Filter untuk mengecualikan tipe 'Milk Tea Fruity' (sesuai request sebelumnya)
        .neq('products_type', 'Milk Tea Fruity')
        .order('products_name');
        
      if (!error) setProducts(data);
      else console.error('Error fetching products:', error);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleCardClick = (product: Product) => {
    setSelectedProduct(product);
    setActionType(null); // Reset aksi saat membuka modal baru
    
    // Set waktu default
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const formattedDateTime = now.toISOString().slice(0, 16);
    
    setUpdateDate(formattedDateTime);
    setQuantity('');
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setActionType(null);
  };

  const handleStockUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      alert('Jumlah harus diisi dan lebih dari 0.');
      return;
    }

    const isoDate = new Date(updateDate).toISOString();
    
    // LOGIKA BARU: Jika aksi 'remove', jadikan jumlah negatif
    let finalQuantity = parseInt(quantity);
    if (actionType === 'remove') {
      finalQuantity = -finalQuantity;
    }

    const { error } = await supabase.rpc('tambah_stok', {
      product_id_to_update: selectedProduct.products_id,
      quantity_to_add: finalQuantity, // Kirim angka positif atau negatif
      update_date: isoDate,
    });

    if (error) {
      alert('Gagal update stok: ' + error.message);
    } else {
      const actionText = actionType === 'add' ? 'ditambah' : 'dikurangi';
      alert(`Stok ${selectedProduct.products_name} berhasil ${actionText}!`);
      closeModal();
    }
  };

  if (loading) return <main className="container py-5 text-center"><p>Memuat produk...</p></main>;

  return (
    <main className="container py-5">
      <h1 className="text-center mb-4">Kelola Stok Produk</h1>
      
      <div className="row row-cols-2 row-cols-md-4 g-3">
        {products.map((product) => (
          <div key={product.products_id} className="col">
            <button 
              className="btn btn-outline-dark w-100 h-100 p-3" 
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

      {/* Modal */}
      {selectedProduct && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {/* Judul Dinamis */}
                    {!actionType 
                      ? `Pilih Aksi: ${selectedProduct.products_name}` 
                      : actionType === 'add' 
                        ? `Tambah Stok: ${selectedProduct.products_name}`
                        : `Kurangi Stok: ${selectedProduct.products_name}`
                    }
                  </h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>

                <div className="modal-body">
                  {/* TAMPILAN 1: PILIH AKSI */}
                  {!actionType ? (
                    <div className="d-grid gap-3">
                      <button 
                        className="btn btn-success btn-lg" 
                        onClick={() => setActionType('add')}
                      >
                        + Tambah Stok (Barang Masuk)
                      </button>
                      <button 
                        className="btn btn-danger btn-lg" 
                        onClick={() => setActionType('remove')}
                      >
                        - Kurangi Stok (Barang Keluar/Rusak)
                      </button>
                    </div>
                  ) : (
                    /* TAMPILAN 2: FORM INPUT */
                    <form onSubmit={handleStockUpdate}>
                      <div className="mb-3">
                        <label htmlFor="quantity" className="form-label">
                          {actionType === 'add' ? 'Jumlah Penambahan' : 'Jumlah Pengurangan'}
                        </label>
                        <input 
                          id="quantity" 
                          type="number" 
                          className="form-control" 
                          value={quantity} 
                          onChange={(e) => setQuantity(e.target.value)} 
                          placeholder="Contoh: 50" 
                          autoFocus 
                          required 
                          min="1"
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="updateDate" className="form-label">Tanggal</label>
                        <input 
                          id="updateDate" 
                          type="datetime-local" 
                          className="form-control" 
                          value={updateDate} 
                          onChange={(e) => setUpdateDate(e.target.value)} 
                          required 
                        />
                      </div>
                      
                      <div className="d-flex justify-content-end gap-2">
                        {/* Tombol Kembali ke pilihan aksi */}
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={() => setActionType(null)}
                        >
                          Kembali
                        </button>
                        
                        <button 
                          type="submit" 
                          className={`btn ${actionType === 'add' ? 'btn-success' : 'btn-danger'}`}
                        >
                          {actionType === 'add' ? 'Simpan Penambahan' : 'Simpan Pengurangan'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}