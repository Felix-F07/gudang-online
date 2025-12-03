'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient'; // Perhatikan path import naik 3 level
import { useRouter } from 'next/navigation';

interface Product {
  products_id: number;
  products_name: string;
  inventory: {
    inventory_quantity: number;
  }[];
}

export default function TambahPembukuanPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [transactionDate, setTransactionDate] = useState('');
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
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
      }
      setLoading(false);
      const now = new Date();
      setTransactionDate(now.toISOString().split('T')[0]);
    };
    fetchProducts();
  }, []);

  const handleQuantityChange = (productId: number, value: string) => {
    const numValue = parseInt(value);
    setQuantities(prev => ({
      ...prev,
      [productId]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const itemsSold = Object.entries(quantities).filter(([_, qty]) => qty > 0);

    if (itemsSold.length === 0) {
      alert('Belum ada produk yang diisi.');
      setSaving(false);
      return;
    }

    const isoDate = new Date(transactionDate).toISOString();
    let successCount = 0;

    for (const [productIdStr, qty] of itemsSold) {
      const productId = parseInt(productIdStr);
      const quantityChange = -qty; 
      const { error } = await supabase.rpc('tambah_stok', {
        product_id_to_update: productId,
        quantity_to_add: quantityChange,
        update_date: isoDate,
      });
      if (!error) successCount++;
    }

    setSaving(false);
    alert(`Pembukuan Berhasil! ${successCount} produk tercatat.`);
    router.push('/pembukuan'); // KEMBALI KE LIST PEMBUKUAN
  };

  if (loading) return <main className="container py-5 text-center"><p>Memuat...</p></main>;

  return (
    <main className="container py-5">
      <h1 className="text-center mb-4">Input Pembukuan Baru</h1>
      <form onSubmit={handleSubmit}>
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <label className="form-label fw-bold">Tanggal</label>
            <input type="date" className="form-control" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} required />
          </div>
        </div>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 mb-5">
          {products.map((product) => (
            <div key={product.products_id} className="col">
              <div className="card h-100 shadow-sm border-0 bg-light">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-1 fw-bold">{product.products_name}</h6>
                    <small className="text-muted">Stok: <strong className="text-dark">{product.inventory?.[0]?.inventory_quantity || 0}</strong></small>
                  </div>
                  <div style={{ width: '100px' }}>
                    <input type="number" className="form-control text-center fw-bold" placeholder="0" min="0" value={quantities[product.products_id] || ''} onChange={(e) => handleQuantityChange(product.products_id, e.target.value)} style={{ backgroundColor: (quantities[product.products_id] || 0) > 0 ? '#d1e7dd' : 'white' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="fixed-bottom bg-white border-top p-3 shadow-lg">
          <div className="container d-flex justify-content-between gap-2">
            {/* Tombol Batal kembali ke /pembukuan */}
            <Link href="/pembukuan" className="btn btn-outline-secondary flex-grow-1">Batal</Link>
            <button type="submit" className="btn btn-primary flex-grow-1 fw-bold" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </div>
      </form>
    </main>
  );
}