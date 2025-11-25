import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container">
      <h1>Gudang Online Teh Poci</h1>
      <div className="button-group">
        {/* Tombol baru ditambahkan di sini */}
        <Link href="/lihat-stok" className="btn btn-primary"> 
          Lihat Stok Produk
        </Link>
        <Link href="/tambah-stok" className="btn btn-primary">
          Tambah / hapus Stok Produk
        </Link>
        <Link href="/tambah-produk" className="btn btn-primary">
          Tambah Produk
        </Link>
        <button className="btn btn-secondary" disabled>Buat Pembukuan</button>
      </div>
    </main>
  );
}