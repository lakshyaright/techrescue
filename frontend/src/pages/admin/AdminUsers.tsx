import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { api } from '../../services/api';
import { 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  RotateCcw, 
  UserPlus, 
  Building2, 
  Laptop, 
  Wrench, 
  Shield, 
  Loader2, 
  AlertCircle,
  X
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { users, refreshUsers } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Create User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState<UserRole>('CLIENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Bangalore, India');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // Refresh users on mount
  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUsers();
    setIsRefreshing(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/register', {
        name,
        email: email.trim().toLowerCase(),
        password,
        role: modalRole,
        company,
        phone,
        location,
        title: title || (modalRole === 'CLIENT' ? 'IT Director' : modalRole === 'EXPERT' ? 'Principal Specialist' : 'Field Technician')
      });

      if (res.success) {
        setModalSuccess(`Successfully created user: ${name} (${modalRole})`);
        await refreshUsers();
        setTimeout(() => {
          setIsModalOpen(false);
          setName('');
          setEmail('');
          setCompany('');
          setTitle('');
          setModalSuccess(null);
        }, 1200);
      } else {
        setModalError(res.error || 'Failed to create user in database.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Database error while creating user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              User & Identity Directory
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              PostgreSQL Live: {users.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time database directory of Enterprise Clients, Vetted Remote Experts, and Field Engineers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Reload from PostgreSQL"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Directory'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user name, corporate email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="sm:w-56">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="CLIENT">Clients ({users.filter(u => u.role === 'CLIENT').length})</option>
            <option value="EXPERT">Remote Experts ({users.filter(u => u.role === 'EXPERT').length})</option>
            <option value="ENGINEER">Field Engineers ({users.filter(u => u.role === 'ENGINEER').length})</option>
            <option value="ADMIN">Administrators ({users.filter(u => u.role === 'ADMIN').length})</option>
          </select>
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Organization / Title</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Rate / Comp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600 mb-1">No users found matching query</p>
                    <p className="text-[11px]">Click "Create User" to add a new account to the database.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">{u.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`font-mono text-[11px] uppercase px-2 py-0.5 rounded-sm font-semibold ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        u.role === 'CLIENT' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        u.role === 'EXPERT' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-medium text-slate-900 block">{u.company || 'Enterprise Account'}</span>
                      <span className="text-[11px] text-slate-500">{u.title || 'Technical Member'}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {u.location || 'India Remote'}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {u.hourlyRate ? `₹${u.hourlyRate}/hr` : '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified in DB</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="text-xs text-slate-400 font-mono">
                        {u.id}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating Users Directly into PostgreSQL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Create New Database User</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Role</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalRole('CLIENT')}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      modalRole === 'CLIENT' ? 'border-blue-600 bg-blue-50 text-blue-800 font-semibold' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-600" />
                    <span>Client</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalRole('EXPERT')}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      modalRole === 'EXPERT' ? 'border-blue-600 bg-blue-50 text-blue-800 font-semibold' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-600" />
                    <span>Expert</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalRole('ENGINEER')}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      modalRole === 'ENGINEER' ? 'border-blue-600 bg-blue-50 text-blue-800 font-semibold' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-600" />
                    <span>Field Tech</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalRole('ADMIN')}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      modalRole === 'ADMIN' ? 'border-blue-600 bg-blue-50 text-blue-800 font-semibold' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-600" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anand Varma"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="anand@company.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Organization / Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. NetOps Global"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation / Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Network Specialist"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location / Hub</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to PostgreSQL...</span>
                    </>
                  ) : (
                    <span>Create & Insert into Database</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
