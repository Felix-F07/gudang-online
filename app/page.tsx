import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container">
      <h1>Gudang Minuman Online</h1>
      <div className="button-group">
        {/* Tombol baru ditambahkan di sini */}
        <Link href="/lihat-stok" className="btn btn-primary"> 
          Lihat Stok Produk
        </Link>
        <Link href="/tambah-stok" className="btn btn-primary">
          Tambah Stok Produk
        </Link>
        <Link href="/tambah/hapus-produk" className="btn btn-primary">
          Tambah Produk Baru
        </Link>
        <button className="btn btn-secondary" disabled>Buat Pembukuan (Segera Hadir)</button>
      </div>
    </main>
  );
}