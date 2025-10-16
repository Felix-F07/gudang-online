'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

// Fungsi untuk memformat angka dengan titik ribuan
const formatPrice = (value: string): string => {
  if (!value) return '';
  // Hapus semua karakter selain angka
  const numberValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
  // Jika bukan angka, kembalikan string kosong
  if (isNaN(numberValue)) return '';
  // Format dengan titik
  return numberValue.toLocaleString('id-ID');
};

// Fungsi untuk menghapus format titik
const unformatPrice = (value: string): string => {
  return value.replace(/\./g, '');
};

export default function TambahProdukPage() {
  const [productName, setProductName] = useState<string>('');
  // State sekarang menyimpan harga tanpa format (contoh: "10000")
  const [productPrice, setProductPrice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = unformatPrice(e.target.value);
    // Hanya perbarui state jika inputnya adalah angka
    if (!isNaN(Number(rawValue))) {
      setProductPrice(rawValue);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!productName || !productPrice) {
      alert('Nama produk dan harga tidak boleh kosong!');
      setIsLoading(false);
      return;
    }

    const { error } = await supabase
      .from('products')
      .insert([
        { products_name: productName, products_price: Number(productPrice) } // Kirim harga murni
      ]);

    if (error) {
      alert('Penambahan gagal: ' + error.message);
    } else {
      alert('Penambahan berhasil!');
      setProductName('');
      setProductPrice('');
    }

    setIsLoading(false);
  };

  return (
    <main className="container">
      <h1>Tambah Produk Baru</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="productName">Nama Produk</label>
          <input
            id="productName"
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Contoh: Kopi Susu"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="productPrice">Harga Produk</label>
          <input
            id="productPrice"
            type="text" // Diubah dari "number" ke "text"
            inputMode="numeric" // Membantu menampilkan keyboard angka di mobile
            value={formatPrice(productPrice)} // Tampilkan harga yang sudah diformat
            onChange={handlePriceChange} // Gunakan fungsi handler baru
            placeholder="Contoh: 8.000"
            disabled={isLoading}
          />
        </div>
        <button type="submit" className="button" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan Produk'}
        </button>
      </form>
      <Link href="/" className="back-button">
        &larr; Kembali ke Halaman Utama
      </Link>
    </main>
  );
}