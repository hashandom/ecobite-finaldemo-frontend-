import React, { useState, useEffect } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { DataTable, Column } from '@/components/composite/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/composite/Modal';
import { ConfirmDialog } from '@/components/composite/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { SearchBar } from '@/components/composite/SearchBar';
import { UserPlus, UserCheck, Shield, Eye, Edit2, Trash2, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthService } from '@/services/auth.service';

import { Permission } from '@/types';

const PERMISSION_GROUPS = {
  Product: [
    'PRODUCT_MODULE_ACCESS',
    'PRODUCT_READ',
    'PRODUCT_CREATE',
    'PRODUCT_UPDATE',
    'PRODUCT_DELETE',
    'PRODUCT_UPDATE_STOCK',
  ],
  Supplier: [
    'SUPPLIER_MODULE_ACCESS',
    'SUPPLIER_READ',
    'SUPPLIER_CREATE',
    'SUPPLIER_UPDATE',
    'SUPPLIER_DELETE',
    'SUPPLIER_ASSIGN_PRODUCT',
    'SUPPLIER_UPDATE_RATING',
  ],
  Batch: [
    'BATCH_MODULE_ACCESS',
    'BATCH_READ',
    'BATCH_CREATE',
    'BATCH_UPDATE',
    'BATCH_ALLOCATE',
    'BATCH_SPOIL',
    'BATCH_RECALL',
  ],
  Location: [
    'LOCATION_MODULE_ACCESS',
    'LOCATION_READ',
    'LOCATION_CREATE',
    'LOCATION_ASSIGN_BATCH',
    'LOCATION_MOVE_BATCH',
  ],
  'QR Code': [
    'QR_MODULE_ACCESS',
  ],
  User: [
    'USER_MANAGEMENT_ACCESS',
    'USER_READ',
    'USER_CREATE',
    'USER_UPDATE',
    'USER_DELETE',
  ],
};

export const StaffPage = () => {
  const { staff, loading, fetchStaff, createStaff, updateStaff, deleteUser, getUserById } = useUsers();
  const { roles } = useRoles();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [createdUserTempPassword, setCreatedUserTempPassword] = useState<{
    username: string;
    temporaryPassword: string;
  } | null>(null);
  
  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STAFF');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [locked, setLocked] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleCreate = () => {
    setSelectedStaff(null);
    setUsername('');
    setEmail('');
    setRole('STAFF');
    setStatus('ACTIVE');
    setLocked(false);
    setPermissions([]);
    setIsModalOpen(true);
  };

  const handleEditClick = async (staffMember: any) => {
    setSelectedStaff(staffMember);
    // Fetch fresh user data from API
    const freshUser = await getUserById(staffMember.id);
    const userToUse = freshUser || staffMember;
    
    setUsername(userToUse.username);
    setEmail(userToUse.email || '');
    setRole(userToUse.role);
    setStatus(userToUse.status);
    setLocked(userToUse.locked || false);
    setPermissions(userToUse.permissions || []);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    
    if (selectedStaff?.id) {
      const updatePayload = {
        email,
        role,
        status,
        locked,
        permissions
      };
      const success = await updateStaff(selectedStaff.id, updatePayload);
      if (success) setIsModalOpen(false);
    } else {
      const createPayload = {
        username,
        email,
        role,
        permissions
      };
      const response = await createStaff(createPayload);
      if (response) {
        setIsModalOpen(false);
        if (response.temporaryPassword) {
          setCreatedUserTempPassword({
            username: response.username,
            temporaryPassword: response.temporaryPassword
          });
        }
      }
    }
  };

  const handleDeleteClick = (staffMember: any) => {
    setSelectedStaff(staffMember);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedStaff?.id) {
      await deleteUser(selectedStaff.id);
      setIsDeleteOpen(false);
    }
  };

  const handleUnlock = async (username: string) => {
    try {
      await AuthService.unlockAccount(username);
      toast.success(`Account for ${username} unlocked successfully`);
      fetchStaff();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to unlock account');
    }
  };

  const filteredStaff = staff.filter(member => 
    member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns: Column[] = [
    {
      key: 'actions',
      label: 'Actions',
      width: 'w-24',
      render: (_, row: any) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleEditClick(row)} 
            className="text-muted hover:text-primary hover:bg-surface transition-colors"
            title="Edit"
          >
            <Edit2 size={18} />
          </Button>
          {row.locked && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleUnlock(row.username)} 
              className="text-warning hover:text-warning hover:bg-warning/10 transition-colors"
              title="Unlock Account"
            >
              <Unlock size={18} />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleDeleteClick(row)} 
            className="text-danger hover:text-danger hover:bg-danger/10 transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      )
    },
    {
      key: 'username',
      label: 'Username',
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-text flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-sans">
            {val.charAt(0).toUpperCase()}
          </div>
          {val}
        </span>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (val) => <span className="text-sm text-muted">{val || '-'}</span>
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          <Shield size={12} />
          {val}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => (
        <Badge variant={val === 'ACTIVE' ? 'success' : 'danger'}>
          {val}
        </Badge>
      )
    },
    {
      key: 'locked',
      label: 'Account Status',
      sortable: true,
      render: (val) => (
        <Badge variant={val ? 'danger' : 'success'}>
          {val ? 'Locked' : 'Unlocked'}
        </Badge>
      )
    },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (val: string[] | undefined) => {
        if (!val || val.length === 0) return <span className="text-muted text-xs">None</span>;
        return (
          <div className="flex flex-wrap gap-1 max-w-[240px]">
            {val.slice(0, 3).map((p) => (
              <span key={p} className="text-[10px] bg-surface border border-border px-1.5 py-0.5 rounded font-mono text-muted">
                {p.replace(/^(PRODUCT|SUPPLIER|BATCH|LOCATION|USER|QR)_/, '')}
              </span>
            ))}
            {val.length > 3 && (
              <span className="text-[10px] text-primary font-semibold flex items-center">
                +{val.length - 3} more
              </span>
            )}
          </div>
        );
      }
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-3">
            Staff Management
          </h1>
          <p className="text-muted">Manage staff accounts, department roles, and user access levels.</p>
        </div>
        <Button variant="gradient" onClick={handleCreate} className="flex items-center gap-2 shrink-0">
          <UserPlus size={16} />
          Add Staff
        </Button>
      </div>

      <div className="flex justify-between gap-4">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Search by username, email or role..."
          className="w-full sm:max-w-md"
        />
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredStaff}
          loading={loading}
          empty={
            <div className="text-center py-12">
              <UserCheck size={48} className="mx-auto text-muted mb-4 opacity-30" />
              <h3 className="text-lg font-medium text-text">No Staff Found</h3>
              <p className="text-muted mt-1 max-w-sm mx-auto">
                No staff members match the query or are registered yet.
              </p>
            </div>
          }
        />
      </div>

      {/* Add/Edit Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedStaff ? "Edit Staff Member" : "Add New Staff Member"}
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" type="submit" form="staff-form">
              Save Staff
            </Button>
          </>
        }
      >
        <form id="staff-form" onSubmit={handleSave} className="space-y-4 p-6 pt-2">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. staff_member"
            required
            disabled={!!selectedStaff}
          />
          
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. staff@test.com"
          />
          
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={roles.map(r => ({ label: r.name, value: r.name }))}
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Inactive', value: 'INACTIVE' }
            ]}
          />

          <Select
            label="Locked"
            value={locked ? 'true' : 'false'}
            onChange={(e) => setLocked(e.target.value === 'true')}
            options={[
              { label: 'No (Unlocked)', value: 'false' },
              { label: 'Yes (Locked)', value: 'true' }
            ]}
          />

          {/* Grouped Permission checkboxes */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text block">Permissions Control</label>
            <div className="max-h-60 overflow-y-auto border border-border rounded-lg p-3 space-y-4 bg-surface/50">
              {Object.entries(PERMISSION_GROUPS).map(([groupName, perms]) => (
                <div key={groupName} className="space-y-1.5">
                  <div className="flex justify-between items-center border-b border-border pb-1">
                    <span className="text-xs font-bold text-primary tracking-wider uppercase">{groupName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const allChecked = perms.every(p => permissions.includes(p as Permission));
                        if (allChecked) {
                          setPermissions(prev => prev.filter(p => !perms.includes(p)));
                        } else {
                          const toAdd = perms.filter(p => !permissions.includes(p as Permission)) as Permission[];
                          setPermissions(prev => [...prev, ...toAdd]);
                        }
                      }}
                      className="text-[10px] text-primary hover:underline font-medium cursor-pointer"
                    >
                      {perms.every(p => permissions.includes(p as Permission)) ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
                    {perms.map((p) => {
                      const isChecked = permissions.includes(p as Permission);
                      return (
                        <label key={p} className="flex items-start gap-2 text-xs text-text cursor-pointer hover:bg-surface-hover/30 p-1 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setPermissions(prev => prev.filter(item => item !== p));
                              } else {
                                setPermissions(prev => [...prev, p as Permission]);
                              }
                            }}
                            className="mt-0.5 rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          <span className="font-mono text-[11px] text-muted-foreground">{p.replace(/^(PRODUCT|SUPPLIER|BATCH|LOCATION|USER|QR)_/, '')}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Staff Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Staff Member"
        message={`Are you sure you want to delete staff account "${selectedStaff?.username}"? This action cannot be undone.`}
        confirmLabel="Delete User"
        variant="danger"
      />

      {/* Temporary Password Modal */}
      <Modal
        isOpen={!!createdUserTempPassword}
        onClose={() => setCreatedUserTempPassword(null)}
        title="Temporary Password Generated"
        footer={
          <Button variant="primary" onClick={() => setCreatedUserTempPassword(null)}>
            Done
          </Button>
        }
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
            <UserCheck size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text">Staff Member Registered</h3>
            <p className="text-sm text-muted mt-1">
              User <strong className="text-text">{createdUserTempPassword?.username}</strong> has been created.
            </p>
          </div>
          <div className="bg-surface border border-border p-4 rounded-xl space-y-2 text-left">
            <span className="text-xs font-semibold text-muted tracking-wider uppercase block">Temporary Password</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={createdUserTempPassword?.temporaryPassword || ''}
                className="bg-card border border-border rounded-lg px-3 py-2 text-sm font-mono flex-1 focus:outline-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (createdUserTempPassword?.temporaryPassword) {
                    navigator.clipboard.writeText(createdUserTempPassword.temporaryPassword);
                    toast.success('Password copied to clipboard!');
                  }
                }}
              >
                Copy
              </Button>
            </div>
          </div>
          <p className="text-xs text-danger font-medium">
            ⚠️ Share this password with the staff member. They will need to change it on their first login.
          </p>
        </div>
      </Modal>
    </div>
  );
};
