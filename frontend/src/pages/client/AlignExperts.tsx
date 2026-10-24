import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { User } from '../../types';
import { Search, Star, MapPin, Award, CheckCircle2, ShieldCheck, Clock, UserCheck } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const AlignExperts: React.FC = () => {
  const { users } = useAuth();
  const { tickets, acceptJobAsExpert } = useData();

  const [search, setSearch] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string>('ALL');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<User | null>(null);
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [targetTicketId, setTargetTicketId] = useState<string>('');
  const [hireSuccess, setHireSuccess] = useState<string | null>(null);

  const experts = users.filter(u => u.role === 'EXPERT');

  const filteredExperts = experts.filter(e => {
    const matchesSearch = 
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.skills && e.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))) ||
      (e.bio && e.bio.toLowerCase().includes(search.toLowerCase()));

    const matchesExpertise = 
      selectedExpertise === 'ALL' || 
      (e.skills && e.skills.some(s => s.toLowerCase().includes(selectedExpertise.toLowerCase())));

    const matchesAvail = !onlyAvailable || e.isAvailable;

    return matchesSearch && matchesExpertise && matchesAvail;
  });

  const openTickets = tickets.filter(t => t.status === 'OPEN');

  const handleHireSubmit = async () => {
    if (!selectedExpert || !targetTicketId) return;
    const res = await acceptJobAsExpert(targetTicketId, selectedExpert.id);
    if (res.success) {
      setHireSuccess(`Specialist ${selectedExpert.name} was successfully aligned to incident!`);
      setTimeout(() => {
        setHireModalOpen(false);
        setHireSuccess(null);
      }, 1500);
    } else {
      alert(res.error || 'Failed to align specialist');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Align Remote IT Experts
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Vetted tier-3 cloud architects, firewall engineers, and enterprise infrastructure specialists
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, skill (e.g. Terraform, BGP, Azure)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                onlyAvailable
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              ● Available Now Only
            </button>
          </div>
        </div>

        {/* Segmented Expertise Filters */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { id: 'ALL', label: 'All Disciplines' },
            { id: 'Azure', label: 'Azure Cloud' },
            { id: 'AWS', label: 'AWS Solutions' },
            { id: 'Firewall', label: 'Firewall & Security' },
            { id: 'Kubernetes', label: 'Kubernetes & DevOps' },
            { id: 'Routing', label: 'BGP & Core Routing' }
          ].map((exp) => (
            <button
              key={exp.id}
              onClick={() => setSelectedExpertise(exp.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedExpertise === exp.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {exp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expert Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredExperts.map((exp) => (
          <div
            key={exp.id}
            className="p-6 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center">
                    {exp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{exp.name}</span>
                      {exp.verified && (
                        <span title="Vetted Specialist">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500">{exp.title}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{exp.rating}</span>
                      </span>
                      <span>·</span>
                      <span>{exp.experienceYears} yrs experience</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{exp.location}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                    ₹{exp.hourlyRate}/hr
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium block">
                    ● Available Now
                  </span>
                </div>
              </div>

              {/* Bio summary */}
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {exp.bio}
              </p>

              {/* Skills text list adhering to zero-pill rule */}
              <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100 flex flex-wrap gap-x-2 gap-y-1">
                <span className="font-semibold text-slate-400">Specialties:</span>
                {exp.skills?.map((sk, idx) => (
                  <span key={idx} className="font-medium text-slate-700">
                    {sk}{idx < (exp.skills?.length || 0) - 1 ? ' ·' : ''}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedExpert(exp)}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                View Full Profile
              </button>

              <button
                onClick={() => {
                  setSelectedExpert(exp);
                  setTargetTicketId(openTickets[0]?.id || '');
                  setHireModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
              >
                Hire / Align to Incident
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Modal */}
      {selectedExpert && !hireModalOpen && (
        <Modal
          isOpen={!!selectedExpert}
          onClose={() => setSelectedExpert(null)}
          title={selectedExpert.name}
          subtitle={selectedExpert.title}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-500">Hourly Rate</span>
                <span className="font-mono text-base font-bold text-slate-900 block mt-0.5">
                  ₹{selectedExpert.hourlyRate}/hr
                </span>
              </div>
              <div>
                <span className="text-slate-500">Experience</span>
                <span className="font-semibold text-slate-900 block mt-0.5">
                  {selectedExpert.experienceYears} Years
                </span>
              </div>
              <div>
                <span className="text-slate-500">Completed Incidents</span>
                <span className="font-semibold text-slate-900 block mt-0.5">
                  {selectedExpert.completedJobsCount} Verified
                </span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-1">Professional Background</span>
              <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {selectedExpert.bio}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-1">Industry Certifications</span>
              <ul className="space-y-1 text-slate-700">
                {selectedExpert.certifications?.map((c, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setHireModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
              >
                Assign to Open Query
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Hire & Assign Modal */}
      {hireModalOpen && selectedExpert && (
        <Modal
          isOpen={hireModalOpen}
          onClose={() => setHireModalOpen(false)}
          title={`Align ${selectedExpert.name} to Incident`}
          subtitle="Instant assignment with transactional ticket lock"
        >
          <div className="space-y-4 text-xs">
            {hireSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">{hireSuccess}</h4>
              </div>
            ) : openTickets.length === 0 ? (
              <div className="p-6 text-center space-y-3">
                <p className="text-slate-600">
                  You currently have no unassigned OPEN queries. Please raise a new query first.
                </p>
                <button
                  onClick={() => {
                    setHireModalOpen(false);
                    // navigate to raise
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold"
                >
                  Raise Query Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Incident Ticket to Align *
                  </label>
                  <select
                    value={targetTicketId}
                    onChange={(e) => setTargetTicketId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    {openTickets.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.ticketNumber} - {t.title} ({t.priority})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Agreed Rate:</span>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    ₹{selectedExpert.hourlyRate}/hour (Backed by Escrow)
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setHireModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleHireSubmit}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                  >
                    Confirm Alignment & Lock
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
