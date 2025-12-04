'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function TambahProdukPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('Creamy'); // Default
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !price) {
      alert("Nama dan Harga harus diisi!");
      setLoading(false);
      return;
    }

    // 1. Masukkan ke tabel 'products'
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert([{ 
        products_name: name, 
        products_price: parseInt(price),
        products_type: type
      }])
      .select();

    if (productError) {
      alert('Gagal menambah produk: ' + productError.message);
      setLoading(false);
      return;
    }

    // 2. Otomatis buat data 'inventory' awal (0) untuk produk baru ini
    if (productData && productData.length > 0) {
      const newProductId = productData[0].products_id;
      const { error: invError } = await supabase
        .from('inventory')
        .insert([{ 
          products_id: newProductId, 
          inventory_quantity: 0 
        }]);
        
      if (invError) console.error("Gagal inisialisasi inventory:", invError);
    }

    setLoading(false);
    alert('Produk baru berhasil ditambahkan!');
    router.push('/'); // Kembali ke menu utama
  };

  return (
    <main className="container py-5">
      {/* --- HEADER BARU --- */}
      <div className="d-flex justify-content-end mb-4">
        <Link href="/" className="btn btn-outline-secondary">
          Menu Utama
        </Link>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Tambah Produk Baru</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Nama Produk</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Contoh: Hazelnut Choco"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Harga (Rp)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Contoh: 10000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Kategori / Tipe</label>
                  <select 
                    className="form-select" 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="Original">Original</option>
                    <option value="Creamy">Creamy</option>
                    <option value="Fruity">Fruity</option>
                    <option value="Special">Special</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 fw-bold"
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}