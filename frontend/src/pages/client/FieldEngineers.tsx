import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { User } from '../../types';
import { Search, Star, MapPin, Wrench, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const FieldEngineers: React.FC = () => {
  const { users } = useAuth();
  const { tickets, assignEngineerToTicket } = useData();

  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedEngineer, setSelectedEngineer] = useState<User | null>(null);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [targetTicketId, setTargetTicketId] = useState<string>('');
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  const engineers = users.filter(u => u.role === 'ENGINEER');

  const filteredEngineers = engineers.filter(eng => {
    const matchesSearch =
      eng.name.toLowerCase().includes(search.toLowerCase()) ||
      (eng.skills && eng.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))) ||
      (eng.location && eng.location.toLowerCase().includes(search.toLowerCase()));

    const matchesCity = selectedCity === 'ALL' || (eng.location && eng.location.includes(selectedCity));

    return matchesSearch && matchesCity;
  });

  const activeTickets = tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED');

  const handleDispatchSubmit = async () => {
    if (!selectedEngineer || !targetTicketId) return;
    const res = await assignEngineerToTicket(targetTicketId, selectedEngineer.id);
    if (res.success) {
      setDispatchSuccess(`Field Engineer ${selectedEngineer.name} has been dispatched!`);
      setTimeout(() => {
        setDispatchModalOpen(false);
        setDispatchSuccess(null);
      }, 1500);
    } else {
      alert(res.error || 'Failed to dispatch engineer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          On-Demand Field Engineers
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Certified on-site hardware, datacenter rack, cabling, and switch technician dispatch network
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by city (Mumbai, Delhi, Bangalore), cabling, switch hardware..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* City Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { id: 'ALL', label: 'All Metro Hubs' },
            { id: 'Mumbai', label: 'Mumbai Datacenter Hub' },
            { id: 'Delhi', label: 'Delhi NCR / Gurgaon' },
            { id: 'Bangalore', label: 'Bangalore Tech Corridors' },
            { id: 'Pune', label: 'Pune Industrial & IT' }
          ].map((city) => (
            <button
              key={city.id}
              onClick={() => setSelectedCity(city.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedCity === city.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {city.label}
            </button>
          ))}
        </div>
      </div>

      {/* Engineers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEngineers.map((eng) => (
          <div
            key={eng.id}
            className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-white font-bold text-base flex items-center justify-center">
                    {eng.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{eng.name}</span>
                      {eng.verified && (
                        <span title="Security Cleared">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500">{eng.title}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{eng.rating}</span>
                      </span>
                      <span>·</span>
                      <span>{eng.experienceYears}+ Years</span>
                      <span>·</span>
                      <span>{eng.completedJobsCount} On-Site Jobs</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                    ₹{eng.hourlyRate}/hr
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium block">
                    ● Ready for Dispatch
                  </span>
                </div>
              </div>

              {/* Location Badge */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Stationed: {eng.location}</span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {eng.bio}
              </p>

              {/* Skills text list */}
              <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100 flex flex-wrap gap-x-2 gap-y-1">
                <span className="font-semibold text-slate-400">Toolsets:</span>
                {eng.skills?.map((sk, idx) => (
                  <span key={idx} className="font-medium text-slate-700">
                    {sk}{idx < (eng.skills?.length || 0) - 1 ? ' ·' : ''}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedEngineer(eng)}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                View Certifications
              </button>

              <button
                onClick={() => {
                  setSelectedEngineer(eng);
                  setTargetTicketId(activeTickets[0]?.id || '');
                  setDispatchModalOpen(true);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Dispatch to Site</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Engineer Detail Modal */}
      {selectedEngineer && !dispatchModalOpen && (
        <Modal
          isOpen={!!selectedEngineer}
          onClose={() => setSelectedEngineer(null)}
          title={selectedEngineer.name}
          subtitle={selectedEngineer.title}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-500">Service Base</span>
                <span className="font-bold text-slate-900 block mt-0.5">{selectedEngineer.location}</span>
              </div>
              <div>
                <span className="text-slate-500">Experience</span>
                <span className="font-bold text-slate-900 block mt-0.5">{selectedEngineer.experienceYears} Years</span>
              </div>
              <div>
                <span className="text-slate-500">Field Track Record</span>
                <span className="font-bold text-slate-900 block mt-0.5">{selectedEngineer.completedJobsCount} Site Jobs</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-1">Equipment & Capabilities</span>
              <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {selectedEngineer.bio}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-1">Field Certifications</span>
              <ul className="space-y-1 text-slate-700">
                {selectedEngineer.certifications?.map((c, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setDispatchModalOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Proceed with Dispatch
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Dispatch to Site Modal */}
      {dispatchModalOpen && selectedEngineer && (
        <Modal
          isOpen={dispatchModalOpen}
          onClose={() => setDispatchModalOpen(false)}
          title={`Dispatch ${selectedEngineer.name} to Incident`}
          subtitle="Direct on-site field assignment"
        >
          <div className="space-y-4 text-xs">
            {dispatchSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">{dispatchSuccess}</h4>
              </div>
            ) : activeTickets.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No active tickets available for on-site dispatch.
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Target Incident Ticket *
                  </label>
                  <select
                    value={targetTicketId}
                    onChange={(e) => setTargetTicketId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    {activeTickets.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.ticketNumber} - {t.title} ({t.environment})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Dispatch ETA Estimate:</span>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    45 - 60 minutes to location in {selectedEngineer.location}
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setDispatchModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDispatchSubmit}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
                  >
                    Dispatch Engineer
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
