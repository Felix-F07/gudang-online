'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

// ... (Definisi Tipe Data - Sama seperti sebelumnya) ...
type InventoryWithProduct = {
  inventory_quantity: number;
  products: {
    products_id: number;
    products_name: string;
  } | null;
};

interface ProductStock {
  products_id: number;
  products_name: string;
  inventory_quantity: number;
}

interface TransactionHistory {
  transactions_created_at: string;
  transactions_quantity_change: number;
}

export default function LihatStokPage() {
  const [stocks, setStocks] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductStock | null>(null);
  const [history, setHistory] = useState<TransactionHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  useEffect(() => {
    // ... (Logika fetchStocks - SAMA SEPERTI SEBELUMNYA, TIDAK DIUBAH) ...
    const fetchStocks = async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          inventory_quantity,
          products!inner ( products_id, products_name )
        `)
        .neq('products.products_type', 'Milk Tea Fruity')
        .order('products_id', { foreignTable: 'products' })
        .returns<InventoryWithProduct[]>();

      if (error) {
        console.error('Error fetching stocks:', error);
        return;
      }
      
      const formattedData = data
        .filter((item): item is Required<typeof item> => !!item.products)
        .map(item => ({
          inventory_quantity: item.inventory_quantity,
          products_id: item.products!.products_id,
          products_name: item.products!.products_name,
        }));
      
      setStocks(formattedData);
      if (loading) setLoading(false);
    };

    fetchStocks();
    window.addEventListener('focus', fetchStocks);
    const interval = setInterval(fetchStocks, 10000);

    return () => {
      window.removeEventListener('focus', fetchStocks);
      clearInterval(interval);
    };
  }, [loading]);

  const handleViewHistory = async (product: ProductStock) => {
    setSelectedProduct(product);
    setHistoryLoading(true);
    // ... (Logika history - SAMA SEPERTI SEBELUMNYA) ...
    const { data } = await supabase
      .from('transactions')
      .select('transactions_created_at, transactions_quantity_change')
      .eq('products_id', product.products_id)
      .eq('transactions_type', 'restock')
      .order('transactions_created_at', { ascending: false });
    if (data) setHistory(data);
    setHistoryLoading(false);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setHistory([]);
  };

  if (loading) return <main className="container py-5 text-center"><p>Memuat stok...</p></main>;

  return (
    <main className="container py-5">
      {/* --- HEADER BARU --- */}
      <div className="d-flex justify-content-end mb-4">
        <Link href="/" className="btn btn-outline-secondary">
          Menu Utama
        </Link>
      </div>

      <h1 className="text-center mb-4">Stok Produk Saat Ini</h1>

      <div className="row row-cols-2 row-cols-md-4 g-3">
        {stocks.map((stock) => (
          <div key={stock.products_id} className="col">
            <button
              className="btn btn-outline-dark w-100 h-100 p-3"
              onClick={() => handleViewHistory(stock)}
            >
              {stock.products_name}: 
              <span className="fw-bold ms-1">{stock.inventory_quantity}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Tombol kembali di bawah DIHAPUS karena sudah pindah ke atas */}

      {/* --- MODAL (TIDAK BERUBAH) --- */}
      {selectedProduct && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Riwayat Stok: {selectedProduct.products_name}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  {historyLoading ? (<p>Memuat riwayat...</p>) : (
                    <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <table className="table table-striped">
                        <thead><tr><th>Tanggal</th><th className="text-end">Jumlah</th></tr></thead>
                        <tbody>
                          {history.length > 0 ? (
                            history.map((entry, index) => (
                              <tr key={index}>
                                <td>
                                  {new Date(entry.transactions_created_at).toLocaleString('id-ID', {
                                    year: 'numeric', month: '2-digit', day: '2-digit',
                                    hour: '2-digit', minute: '2-digit',
                                    hour12: false, timeZone: 'Asia/Jakarta',
                                  })}
                                </td>
                                <td className="text-end">{entry.transactions_quantity_change > 0 ? '+' : ''}{entry.transactions_quantity_change}</td>
                              </tr>
                            ))
                          ) : (<tr><td colSpan={2} className="text-center">Belum ada riwayat.</td></tr>)}
                        </tbody>
                      </table>
                    </div>
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