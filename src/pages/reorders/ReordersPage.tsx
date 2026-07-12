import { useState, useMemo } from 'react';
import { ShoppingCart, CheckCircle, XCircle, Clock, PackageCheck, AlertTriangle } from 'lucide-react';
import { useReorders } from '@/hooks/useReorders';
import { useProducts } from '@/hooks/useProducts';
import { Reorder } from '@/types';
import { DataTable, Column } from '@/components/composite/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SearchBar } from '@/components/composite/SearchBar';
import { LowStockSuppliersModal } from './components/LowStockSuppliersModal';

export const ReordersPage = () => {
  const { reorders, loading, updateReorderStatus } = useReorders();
  const { products } = useProducts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('ALL'); // ALL, PENDING, APPROVED, REJECTED, FULFILLED
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);

  // Enriched Reorders
  const enrichedReorders = useMemo(() => {
    return reorders.map(r => {
      const product = products.find(p => p.id === r.productId);
      return { ...r, productName: product?.name || 'Unknown Product' };
    });
  }, [reorders, products]);

  // Derived filtered reorders
  const filteredReorders = useMemo(() => {
    return enrichedReorders.filter(r => {
      const matchesSearch = r.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filter === 'ALL' || 
        (filter === 'PENDING' && (r.status === 'PENDING' || r.status === 'CREATED')) ||
        r.status === filter;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedReorders, searchTerm, filter]);

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED' | 'FULFILLED') => {
    await updateReorderStatus(id, status);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CREATED':
      case 'PENDING': return <Badge variant="warning"><div className="flex gap-1 items-center w-fit"><Clock size={12}/> Pending</div></Badge>;
      case 'APPROVED': return <Badge variant="success"><div className="flex gap-1 items-center w-fit"><CheckCircle size={12}/> Approved</div></Badge>;
      case 'REJECTED': return <Badge variant="danger"><div className="flex gap-1 items-center w-fit"><XCircle size={12}/> Rejected</div></Badge>;
      case 'FULFILLED': return <Badge variant="primary"><div className="flex gap-1 items-center w-fit"><PackageCheck size={12}/> Fulfilled</div></Badge>;
      default: return <Badge variant="muted">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const columns: Column[] = [
    {
      key: 'actions',
      label: 'Actions',
      width: 'w-24',
      render: (_, row: any) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {(row.status === 'PENDING' || row.status === 'CREATED') && (
            <>
              <Button 
                variant="ghost"
                size="icon" 
                onClick={() => handleUpdateStatus(row.id, 'APPROVED')}
                className="text-success hover:bg-success/10 transition-colors"
                title="Approve Reorder"
              >
                <CheckCircle size={18} />
              </Button>
              <Button 
                variant="ghost"
                size="icon" 
                onClick={() => handleUpdateStatus(row.id, 'REJECTED')}
                className="text-danger hover:bg-danger/10 transition-colors"
                title="Reject Reorder"
              >
                <XCircle size={18} />
              </Button>
            </>
          )}
          {row.status === 'APPROVED' && (
            <Button 
              variant="ghost" 
              onClick={() => handleUpdateStatus(row.id, 'FULFILLED')}
              className="p-1.5 h-auto text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
              title="Mark Fulfilled"
            >
              <PackageCheck size={15} />
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date Created',
      sortable: true,
      render: (value) => <span className="text-sm text-text">{formatDate(value)}</span>,
    },
    {
      key: 'productName',
      label: 'Product',
      sortable: true,
      render: (value) => <span className="font-medium text-text">{value}</span>,
    },
    { 
      key: 'quantity', 
      label: 'Quantity', 
      sortable: true,
      render: (value) => <span className="font-bold text-text">{value} units</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-3">
            Reorders
          </h1>
          <p className="text-muted">Manage product restocks and supplier purchase orders.</p>
        </div>
        <Button 
          variant="danger" 
          onClick={() => setIsLowStockModalOpen(true)}
          className="shrink-0 shadow-md shadow-danger/20 flex items-center gap-2"
        >
          <AlertTriangle size={18} />
          View Low Stock
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 min-w-max pb-1">
            {['ALL', 'PENDING', 'APPROVED', 'FULFILLED', 'REJECTED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  filter === status 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-card text-muted border border-border hover:border-primary/50 hover:text-text'
                }`}
              >
                {status === 'ALL' ? 'All Orders' : status}
              </button>
            ))}
          </div>
        </div>
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Search by product name..."
          className="w-full sm:w-64 shrink-0"
        />
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredReorders}
          loading={loading}
          empty={
            <div className="text-center py-12">
              <ShoppingCart size={48} className="mx-auto text-muted mb-4 opacity-30" />
              <h3 className="text-lg font-medium text-text">No Reorders Found</h3>
              <p className="text-muted mt-1 max-w-sm mx-auto">
                {searchTerm ? 'Try adjusting your search criteria.' : 'There are no pending reorders at this time.'}
              </p>
            </div>
          }
        />
      </div>

      <LowStockSuppliersModal 
        isOpen={isLowStockModalOpen}
        onClose={() => setIsLowStockModalOpen(false)}
      />
    </div>
  );
};
