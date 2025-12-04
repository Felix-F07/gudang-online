'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

// ... (Interface Product - SAMA) ...
interface Product {
  products_id: number;
  products_name: string;
  inventory: {
    inventory_quantity: number;
  }[];
}

export default function TambahStokPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [updateDate, setUpdateDate] = useState('');
  const [actionType, setActionType] = useState<'add' | 'remove' | null>(null);

  useEffect(() => {
    // ... (Fetch logic - SAMA SEPERTI SEBELUMNYA) ...
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          inventory_quantity,
          products!inner ( products_id, products_name, products_type )
        `)
        .neq('products.products_type', 'Milk Tea Fruity')
        .order('products_id', { foreignTable: 'products' });
        
      if (!error && data) {
        const formattedData: Product[] = data.map((item: any) => ({
          products_id: item.products.products_id,
          products_name: item.products.products_name,
          inventory: [{ inventory_quantity: item.inventory_quantity }]
        }));
        formattedData.sort((a, b) => a.products_name.localeCompare(b.products_name));
        setProducts(formattedData);
      } else {
        console.error('Error fetching products:', error);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // ... (Event handlers - SAMA SEPERTI SEBELUMNYA) ...
  const handleCardClick = (product: Product) => {
    setSelectedProduct(product);
    setActionType(null); 
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
    // ... (Logika update stok - SAMA SEPERTI YANG SUDAH KITA PERBAIKI) ...
    event.preventDefault();
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      alert('Jumlah harus diisi dan lebih dari 0.');
      return;
    }

    const isoDate = new Date(updateDate).toISOString();
    let finalQuantity = parseInt(quantity);
    
    if (actionType === 'remove') {
      const currentStock = selectedProduct.inventory?.[0]?.inventory_quantity || 0;
      if (finalQuantity > currentStock) {
        alert(`Jumlah stok ${selectedProduct.products_name} adalah ${currentStock}`);
        finalQuantity = -currentStock;
      } else {
        finalQuantity = -finalQuantity;
      }
    }

    if (actionType === 'remove' && finalQuantity === 0) {
      alert(`Stok ${selectedProduct.products_name} sudah habis (0). Tidak ada yang bisa dikurangi.`);
      return;
    }

    const { error } = await supabase.rpc('tambah_stok', {
      product_id_to_update: selectedProduct.products_id,
      quantity_to_add: finalQuantity, 
      update_date: isoDate,
    });

    if (error) {
      alert('Gagal update stok: ' + error.message);
    } else {
      alert(`Berhasil! Data stok ${selectedProduct.products_name} telah diperbarui.`);
      window.location.reload(); 
    }
  };

  if (loading) return <main className="container py-5 text-center"><p>Memuat produk...</p></main>;

  return (
    <main className="container py-5">
      {/* --- HEADER BARU --- */}
      <div className="d-flex justify-content-end mb-4">
        <Link href="/" className="btn btn-outline-secondary">
          Menu Utama
        </Link>
      </div>

      <h1 className="text-center mb-4">Kelola Stok Produk</h1>
      
      <div className="row row-cols-2 row-cols-md-4 g-3">
        {products.map((product) => (
          <div key={product.products_id} className="col">
            <button 
              className="btn btn-outline-dark w-100 h-100 p-3 d-flex flex-column justify-content-center align-items-center" 
              onClick={() => handleCardClick(product)}
            >
              <div className="fw-bold">{product.products_name}</div>
              <small className="text-muted mt-2">
                Stok: {product.inventory?.[0]?.inventory_quantity || 0}
              </small>
            </button>
          </div>
        ))}
      </div>

      {/* Tombol kembali di bawah DIHAPUS */}

      {/* --- MODAL (TIDAK BERUBAH) --- */}
      {selectedProduct && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
             {/* Isi modal sama persis dengan kode sebelumnya */}
             <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
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
                  {!actionType ? (
                    <div className="d-grid gap-3">
                      <button className="btn btn-success btn-lg" onClick={() => setActionType('add')}>
                        + Tambah Stok (Barang Masuk)
                      </button>
                      <button className="btn btn-danger btn-lg" onClick={() => setActionType('remove')}>
                        - Kurangi Stok (Barang Keluar/Rusak)
                      </button>
                      <p className="text-center text-muted mt-2">
                        Sisa Stok Saat Ini: <strong>{selectedProduct.inventory?.[0]?.inventory_quantity || 0}</strong>
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleStockUpdate}>
                      <div className="mb-3">
                        <label className="form-label">
                          {actionType === 'add' ? 'Jumlah Penambahan' : 'Jumlah Pengurangan'}
                        </label>
                        <input id="quantity" type="number" className="form-control" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Contoh: 50" autoFocus required min="1"/>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Tanggal</label>
                        <input id="updateDate" type="datetime-local" className="form-control" value={updateDate} onChange={(e) => setUpdateDate(e.target.value)} required />
                      </div>
                      <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-secondary" onClick={() => setActionType(null)}>Kembali</button>
                        <button type="submit" className={`btn ${actionType === 'add' ? 'btn-success' : 'btn-danger'}`}>
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