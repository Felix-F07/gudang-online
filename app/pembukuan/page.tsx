'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

// Tipe data untuk transaksi mentah dari database
interface Transaction {
  transactions_id: number;
  transactions_created_at: string;
  transactions_quantity_change: number;
  products: {
    products_name: string;
  };
}

// Tipe data untuk Grouping per Tanggal
interface DailyRecord {
  date: string; // "2025-12-03"
  totalItems: number; // Total barang keluar (penjumlahan qty negatif)
  transactions: Transaction[];
}

export default function ListPembukuanPage() {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<DailyRecord | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      // Ambil transaksi yang quantity-nya NEGATIF (artinya barang keluar/terjual)
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          transactions_id,
          transactions_created_at,
          transactions_quantity_change,
          products ( products_name )
        `)
        .lt('transactions_quantity_change', 0) // Filter: Hanya ambil yang kurang dari 0
        .order('transactions_created_at', { ascending: false });

      if (error) {
        console.error('Error:', error);
      } else if (data) {
        // Proses Grouping berdasarkan Tanggal
        const groups: Record<string, Transaction[]> = {};
        
        data.forEach((trx: any) => {
          // Ambil tanggalnya saja (YYYY-MM-DD)
          const dateKey = new Date(trx.transactions_created_at).toISOString().split('T')[0];
          if (!groups[dateKey]) groups[dateKey] = [];
          groups[dateKey].push(trx);
        });

        // Ubah object group menjadi array supaya bisa di-map
        const recordList: DailyRecord[] = Object.keys(groups).map(date => {
          const trxs = groups[date];
          // Hitung total barang terjual (di-absolutkan karena aslinya negatif)
          const total = trxs.reduce((sum, t) => sum + Math.abs(t.transactions_quantity_change), 0);
          return {
            date,
            totalItems: total,
            transactions: trxs
          };
        });

        // Urutkan tanggal terbaru di atas
        recordList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecords(recordList);
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  // Format tanggal biar cantik (misal: "Rabu, 03 Desember 2025")
  const formatDateIndo = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <main className="container py-5 text-center"><p>Memuat riwayat...</p></main>;

  return (
    <main className="container py-5">
      {/* Header & Tombol Tambah */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* Tombol + Buat Pembukuan */}
        <Link href="/pembukuan/tambah" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
          <span className="fs-5 fw-bold">+</span> Buat Pembukuan
        </Link>
        <Link href="/" className="btn btn-outline-secondary">
          Menu Utama
        </Link>
      </div>

      <h2 className="mb-4">Riwayat Pembukuan</h2>

      {/* List Riwayat */}
      <div className="row g-3">
        {records.length > 0 ? (
          records.map((rec) => (
            <div key={rec.date} className="col-12">
              <div 
                className="card shadow-sm hover-effect" 
                style={{ cursor: 'pointer', transition: '0.2s' }}
                onClick={() => setSelectedRecord(rec)}
              >
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title fw-bold mb-1 text-primary">
                      {formatDateIndo(rec.date)}
                    </h5>
                    <p className="card-text text-muted mb-0 small">
                      {rec.transactions.length} jenis produk terjual
                    </p>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-success fs-6">
                      Total: {rec.totalItems} pcs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-5 text-muted">
            <p>Belum ada data pembukuan.</p>
          </div>
        )}
      </div>

      {/* MODAL POPUP DETAIL */}
      {selectedRecord && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    Detail: {formatDateIndo(selectedRecord.date)}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setSelectedRecord(null)}></button>
                </div>
                <div className="modal-body p-0">
                  <table className="table table-striped mb-0">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th className="ps-4">Nama Produk</th>
                        <th className="text-end pe-4">Terjual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecord.transactions.map((trx) => (
                        <tr key={trx.transactions_id}>
                          <td className="ps-4">{trx.products.products_name}</td>
                          <td className="text-end pe-4 fw-bold">
                            {Math.abs(trx.transactions_quantity_change)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light fw-bold">
                      <tr>
                        <td className="ps-4">TOTAL</td>
                        <td className="text-end pe-4">{selectedRecord.totalItems}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary w-100" onClick={() => setSelectedRecord(null)}>
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}