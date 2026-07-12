import React, { useState } from 'react';
import { useRoles } from '@/hooks/useRoles';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/composite/Modal';
import { Shield, LayoutGrid, CheckSquare, Square } from 'lucide-react';

const AVAILABLE_MODULES = [
  'Dashboard',
  'Products',
  'Suppliers',
  'Reorders',
  'Locations',
  'Batches',
  'Inventory',
  'QR Codes',
  'Alerts',
  'User Management'
];

const AVAILABLE_PERMISSIONS = [
  'Product Read',
  'Product CRUD',
  'Supplier Read',
  'Supplier CRUD',
  'Batch Read',
  'Batch CRUD',
  'Inventory Read',
  'Inventory Adjust',
  'Alert Read',
  'Alert Resolve',
  'Reorder Read',
  'Reorder CRUD'
];

export const RolePage = () => {
  const { roles, loading, createRole, updateRole } = useRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<number | string | null>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const activeRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  const handleToggleModule = async (module: string) => {
    if (!activeRole || !activeRole.id) return;
    const isVisible = activeRole.modules.includes(module);
    const newModules = isVisible 
      ? activeRole.modules.filter(m => m !== module)
      : [...activeRole.modules, module];

    await updateRole(activeRole.id, { modules: newModules });
  };

  const handleTogglePermission = async (permission: string) => {
    if (!activeRole || !activeRole.id) return;
    const hasPerm = activeRole.permissions.includes(permission);
    const newPerms = hasPerm
      ? activeRole.permissions.filter(p => p !== permission)
      : [...activeRole.permissions, permission];

    await updateRole(activeRole.id, { permissions: newPerms });
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;
    const success = await createRole({
      name: newRoleName.toUpperCase(),
      permissions: ['Product Read'],
      modules: ['Dashboard']
    });
    if (success) {
      setIsModalOpen(false);
      setNewRoleName('');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-3">
            Role & Permission Management
          </h1>
          <p className="text-muted">Configure access rights, visibility matrices, and security privileges for roles.</p>
        </div>
        <Button variant="gradient" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 shrink-0">
          <Shield size={16} />
          Create New Role
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Role List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-text flex items-center gap-2">
            System Roles
          </h3>
          <div className="space-y-2">
            {loading && roles.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-muted">Loading roles...</div>
            ) : (
              roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id || null)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                    activeRole?.id === role.id 
                      ? 'bg-primary/10 border-primary text-primary shadow-sm'
                      : 'bg-card border-border text-text hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield size={18} className={activeRole?.id === role.id ? 'text-primary' : 'text-muted'} />
                    <div>
                      <span className="font-bold block">{role.name}</span>
                      <span className="text-xs text-muted">
                        {role.permissions.length} perms · {role.modules.length} modules
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Visibility & Privilege Matrix */}
        {activeRole && (
          <div className="lg:col-span-2 space-y-6">
            {/* Module Visibility Section */}
            <div className="glass-card rounded-xl p-6 border border-border shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <LayoutGrid size={18} className="text-primary" />
                Module Visibility Controls ({activeRole.name})
              </h3>
              <p className="text-sm text-muted">Select which main modules are displayed in the sidebar navigation menu for users with this role.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {AVAILABLE_MODULES.map(module => {
                  const isVisible = activeRole.modules.includes(module);
                  return (
                    <button
                      key={module}
                      onClick={() => handleToggleModule(module)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left ${
                        isVisible
                          ? 'border-primary/30 bg-primary/5 text-primary'
                          : 'border-border bg-card/50 text-muted hover:border-primary/20'
                      }`}
                    >
                      {isVisible ? (
                        <CheckSquare size={18} className="text-primary" />
                      ) : (
                        <Square size={18} className="text-muted" />
                      )}
                      <span className="font-medium text-sm">{module}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Privilege Matrix Section */}
            <div className="glass-card rounded-xl p-6 border border-border shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <Shield size={18} className="text-primary" />
                Security Privilege Matrix ({activeRole.name})
              </h3>
              <p className="text-sm text-muted">Toggle specific action and read authorizations for users under this security role.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {AVAILABLE_PERMISSIONS.map(permission => {
                  const hasPerm = activeRole.permissions.includes(permission) || activeRole.permissions.includes('All');
                  const isAdmin = activeRole.permissions.includes('All');
                  return (
                    <button
                      key={permission}
                      onClick={() => !isAdmin && handleTogglePermission(permission)}
                      disabled={isAdmin}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left ${
                        hasPerm
                          ? 'border-primary/30 bg-primary/5 text-primary'
                          : 'border-border bg-card/50 text-muted hover:border-primary/20'
                      } ${isAdmin ? 'opacity-85 cursor-not-allowed' : ''}`}
                    >
                      {hasPerm ? (
                        <CheckSquare size={18} className="text-primary" />
                      ) : (
                        <Square size={18} className="text-muted" />
                      )}
                      <span className="font-medium text-sm">{permission} {isAdmin && '(Admin Forced)'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Role Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New System Role"
      >
        <form onSubmit={handleCreateRole} className="space-y-4 pt-2">
          <Input
            label="Role Name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="e.g. ACCOUNTANT"
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" type="submit">
              Create Role
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
