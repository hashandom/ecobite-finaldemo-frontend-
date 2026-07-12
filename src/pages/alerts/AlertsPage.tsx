import { useState, useMemo, useEffect } from 'react';
import { BellRing, CheckCircle, AlertTriangle, ShieldAlert, Check, PlusCircle, ShoppingCart } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types';
import { DataTable, Column } from '@/components/composite/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const AlertsPage = () => {
  const { notifications, totalCount, loading, fetchNotifications, markAsRead } = useNotifications();
  
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('UNREAD');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'EXPIRY' | 'STOCK' | 'SYSTEM'>('ALL');
  const [markingId, setMarkingId] = useState<number | string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Derived filtered notifications
  const filteredNotifications = useMemo(() => {
    let result = [...notifications];
    
    // Sort by most recent first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (filter === 'UNREAD') {
      result = result.filter(n => !n.isRead);
    }
    
    if (typeFilter !== 'ALL') {
      result = result.filter(n => {
        if (typeFilter === 'EXPIRY') return n.type === 'EXPIRY_ALERT';
        if (typeFilter === 'STOCK') return n.type === 'STOCK_ALERT' || n.type === 'REORDER_REQUIRED';
        // SYSTEM includes PRODUCT_CREATED, BATCH_CREATED, SUPPLIER_CREATED, etc.
        return n.type !== 'EXPIRY_ALERT' && n.type !== 'STOCK_ALERT' && n.type !== 'REORDER_REQUIRED';
      });
    }
    
    return result;
  }, [notifications, filter, typeFilter]);

  const criticalAlertsCount = useMemo(() => 
    notifications.filter(n => !n.isRead && n.type === 'EXPIRY_ALERT').length, 
    [notifications]
  );

  const handleMarkAsRead = async (id: number | string) => {
    setMarkingId(id);
    await markAsRead(id);
    setMarkingId(null);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'EXPIRY_ALERT': 
        return <Badge variant="danger"><div className="flex gap-1 items-center w-fit"><ShieldAlert size={12}/> Expiry</div></Badge>;
      case 'STOCK_ALERT': 
        return <Badge variant="warning"><div className="flex gap-1 items-center w-fit"><AlertTriangle size={12}/> Stock</div></Badge>;
      case 'REORDER_REQUIRED':
        return <Badge variant="warning"><div className="flex gap-1 items-center w-fit"><ShoppingCart size={12}/> Reorder Req</div></Badge>;
      case 'REORDER_CREATED':
        return <Badge variant="info"><div className="flex gap-1 items-center w-fit"><ShoppingCart size={12}/> Reorder Sent</div></Badge>;
      default: 
        return <Badge variant="info"><div className="flex gap-1 items-center w-fit"><PlusCircle size={12}/> {type?.replace('_', ' ') || 'SYSTEM'}</div></Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const columns: Column[] = [
    {
      key: 'actions',
      label: 'Actions',
      width: 'w-20',
      render: (_, row: Notification) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {!row.isRead && (
            <Button 
              variant="ghost"
              size="icon" 
              onClick={() => handleMarkAsRead(row.id)}
              loading={markingId === row.id}
              className="text-success hover:bg-success/10 transition-colors"
              title="Mark as Read"
            >
              <Check size={18} />
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Time Detected',
      sortable: true,
      render: (value) => <span className="text-sm text-text">{formatDate(value)}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => getTypeBadge(value),
    },
    {
      key: 'message',
      label: 'Message',
      render: (value) => <span className="font-medium text-text">{value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row: Notification) => (
        row.isRead ? 
          <Badge variant="success" className="bg-success/5 text-success">Read</Badge> : 
          <Badge variant="warning" className="bg-warning/5 text-warning">New Alert</Badge>
      )
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-3">
            System Alerts & Notifications
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-danger"></span>
              </span>
            )}
          </h1>
          <p className="text-muted">Real-time alerts and audit logging from your backend notification service.</p>
        </div>
        
        <div className="flex flex-col gap-3 items-end">
          <div className="flex items-center gap-3">
            <div className="flex bg-surface border border-border rounded-lg p-1">
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'UNREAD' ? 'bg-card shadow-sm text-text' : 'text-muted hover:text-text'}`}
                onClick={() => setFilter('UNREAD')}
              >
                Unread ({notifications.filter(n => !n.isRead).length})
              </button>
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'ALL' ? 'bg-card shadow-sm text-text' : 'text-muted hover:text-text'}`}
                onClick={() => setFilter('ALL')}
              >
                All Alerts ({totalCount})
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            {[
              { id: 'ALL', label: 'All Alerts' },
              { id: 'EXPIRY', label: 'Expiry Alerts' },
              { id: 'STOCK', label: 'Stock & Reorders' },
              { id: 'SYSTEM', label: 'System Events' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setTypeFilter(type.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  typeFilter === type.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-card border border-border text-muted hover:border-primary/50 hover:text-text'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {criticalAlertsCount > 0 && (
        <div className="glass-card bg-danger/10 border-danger/30 rounded-xl p-5 shadow-lg animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-danger/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-start sm:items-center gap-4 relative z-10">
            <div className="bg-danger/20 p-3 rounded-full text-danger shrink-0 animate-pulse">
              <ShieldAlert size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-danger-dark">Critical Alerts Requiring Action</h2>
              <p className="text-sm text-danger-dark/80 mt-1">
                You have {criticalAlertsCount} critical alert(s) that need immediate attention. Expired inventory can cause wastage.
              </p>
            </div>
            <Button variant="danger" onClick={() => { setFilter('UNREAD'); setTypeFilter('EXPIRY'); }} className="shrink-0 shadow-md shadow-danger/20">
              View Critical
            </Button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredNotifications}
          loading={loading}
          rowClassName={(row) => `transition-all duration-500 ${markingId === row.id ? 'opacity-50 scale-[0.98] bg-surface/50' : ''}`}
          empty={
            <div className="text-center py-12">
              <CheckCircle size={48} className="mx-auto text-success mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-text">All Clear</h3>
              <p className="text-muted mt-1 max-w-sm mx-auto">
                There are no {filter === 'UNREAD' ? 'unread ' : ''}notifications requiring your attention at this time.
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};
