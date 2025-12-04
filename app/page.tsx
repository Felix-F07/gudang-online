import Link from 'next/link';

export default function Home() {
  return (
    <main className="container py-5">
      {/* Bagian Header / Sambutan */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">Gudang Minuman Online</h1>
        <p className="lead text-muted">
          
        </p>
      </div>

      {/* Grid Menu Dashboard */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        
        {/* Menu 1: Lihat Stok */}
        <div className="col">
          <Link href="/lihat-stok" className="dashboard-card">
            <div className="card h-100 text-center p-4 border-primary border-2 border-bottom-0 border-end-0 border-start-0 shadow-sm">
              <div className="card-body">
                <span className="dashboard-icon">📦</span>
                <h3 className="card-title h4">Lihat Stok</h3>
                <p className="card-text text-muted">
                  Cek sisa stok produk secara real-time dan riwayat transaksi.
                </p>
                <div className="mt-3 btn btn-outline-primary w-100">Buka Stok &rarr;</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Menu 2: Kelola Stok */}
        <div className="col">
          <Link href="/tambah-stok" className="dashboard-card">
            <div className="card h-100 text-center p-4 border-success border-2 border-bottom-0 border-end-0 border-start-0 shadow-sm">
              <div className="card-body">
                <span className="dashboard-icon">🔄</span>
                <h3 className="card-title h4">Kelola Stok</h3>
                <p className="card-text text-muted">
                  Tambah stok barang masuk atau kurangi barang keluar/rusak.
                </p>
                <div className="mt-3 btn btn-outline-success w-100">Update Stok &rarr;</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Menu 3: Pembukuan */}
        <div className="col">
          <Link href="/pembukuan" className="dashboard-card">
            <div className="card h-100 text-center p-4 border-warning border-2 border-bottom-0 border-end-0 border-start-0 shadow-sm">
              <div className="card-body">
                <span className="dashboard-icon">📝</span>
                <h3 className="card-title h4">Pembukuan</h3>
                <p className="card-text text-muted">
                  Rekap penjualan harian dan lihat riwayat omzet produk.
                </p>
                <div className="mt-3 btn btn-outline-warning text-dark w-100">Buka Buku &rarr;</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Menu 4: Tambah Produk Baru */}
        <div className="col">
          <Link href="/tambah-produk" className="dashboard-card">
            <div className="card h-100 text-center p-4 border-secondary border-2 border-bottom-0 border-end-0 border-start-0 shadow-sm">
              <div className="card-body">
                <span className="dashboard-icon">✨</span>
                <h3 className="card-title h4">Produk Baru</h3>
                <p className="card-text text-muted">
                  Daftarkan jenis minuman atau varian baru ke dalam sistem.
                </p>
                <div className="mt-3 btn btn-outline-secondary w-100">Tambah Data &rarr;</div>
              </div>
            </div>
          </Link>
        </div>

      </div>

      {/* Footer Kecil */}
      <div className="text-center mt-5 pt-4 text-muted border-top">
        <small>&copy; 2025 Gudang Online Teh Poci &bull; Dibuat dengan Next.js</small>
      </div>
    </main>
  );
}