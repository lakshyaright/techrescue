import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { MapPin, Navigation, Radio, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EngineerMap: React.FC = () => {
  const { tickets } = useData();
  const navigate = useNavigate();

  const hubs = [
    {
      id: 'dc-mumbai',
      name: 'Mumbai BKC & Navi Mumbai Datacenter Cluster',
      address: 'Plot C-60, G Block, BKC, Bandra East, Mumbai',
      tier: 'Tier-4 Certified',
      status: 'Active Incident On Site',
      activeIncidentId: 'tkt-10230',
      activeIncidentNumber: 'INC-20261008-0002',
      techsOnStandby: 4,
      lat: 19.0657,
      lng: 72.8687
    },
    {
      id: 'dc-ncr',
      name: 'Delhi NCR Cyber City & Noida DC Corridor',
      address: 'DLF Cyber City, Phase 2, Sector 24, Gurgaon, Haryana',
      tier: 'Tier-3 Datacenter',
      status: 'Standby / Patrol',
      techsOnStandby: 6,
      lat: 28.4900,
      lng: 77.0900
    },
    {
      id: 'dc-bangalore',
      name: 'Bangalore Whitefield Enterprise Park',
      address: 'EPIP Zone, Whitefield, Bangalore, Karnataka',
      tier: 'Tier-3+ Hyperscale',
      status: 'Standby / Patrol',
      techsOnStandby: 5,
      lat: 12.9698,
      lng: 77.7499
    },
    {
      id: 'dc-pune',
      name: 'Pune Hinjewadi Phase 1 IT Hub',
      address: 'Rajiv Gandhi Infotech Park, Hinjewadi, Pune',
      tier: 'Enterprise Colocation',
      status: 'Open Ticket Awaiting Dispatch',
      activeIncidentId: 'tkt-10232',
      activeIncidentNumber: 'INC-20261008-0004',
      techsOnStandby: 3,
      lat: 18.5913,
      lng: 73.7389
    }
  ];

  const [selectedHub, setSelectedHub] = useState(hubs[0]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Field Dispatch & Datacenter Service Hubs
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Proximity mapping across Indian metro datacenter zones with live GPS status
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hub Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Regional Dispatch Hubs ({hubs.length})
          </h3>
          <div className="space-y-3">
            {hubs.map((h) => {
              const isSelected = h.id === selectedHub.id;
              return (
                <div
                  key={h.id}
                  onClick={() => setSelectedHub(h)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{h.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{h.tier}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mb-2">{h.address}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span className="flex items-center gap-1 font-semibold text-blue-700">
                      <Radio className="w-3 h-3 text-blue-600" />
                      <span>{h.status}</span>
                    </span>
                    <span className="text-slate-600 font-mono">
                      {h.techsOnStandby} Techs Active
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Hub Interactive Radar / Proximity Map View */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedHub.name}</h3>
                <span className="text-xs text-slate-500">{selectedHub.address}</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-semibold">
                ● 45m Rapid Dispatch Zone
              </span>
            </div>

            {/* Stylized SVG Map Radar Graphic */}
            <div className="w-full h-56 bg-slate-950 rounded-xl relative overflow-hidden flex items-center justify-center p-4 border border-slate-800">
              {/* Radial Circles */}
              <div className="absolute w-44 h-44 rounded-full border border-blue-500/20" />
              <div className="absolute w-32 h-32 rounded-full border border-blue-500/30" />
              <div className="absolute w-20 h-20 rounded-full border border-blue-500/40 animate-pulse" />

              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />

              {/* Central Pin */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg ring-4 ring-rose-500/20 animate-bounce">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono text-white font-bold mt-1 bg-slate-900/90 px-2 py-0.5 rounded-sm border border-slate-700">
                  {selectedHub.lat}° N, {selectedHub.lng}° E
                </span>
              </div>

              {/* Dispatch Tech Dots */}
              <div className="absolute top-10 left-16 flex items-center gap-1 text-[10px] text-blue-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Rajesh K. (On Site)</span>
              </div>
              <div className="absolute bottom-10 right-20 flex items-center gap-1 text-[10px] text-blue-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Amit V. (Standby)</span>
              </div>
            </div>

            {/* Hub Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Tier Rating</span>
                <span className="font-bold text-slate-800 block mt-0.5">{selectedHub.tier}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Average Travel Time</span>
                <span className="font-bold text-slate-800 block mt-0.5">38 Minutes</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Diagnostic Kit</span>
                <span className="font-bold text-slate-800 block mt-0.5">Fluke DSX-8000 + OTDR</span>
              </div>
            </div>
          </div>

          {selectedHub.activeIncidentId && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-blue-900 block">Incident Active at Facility:</span>
                <span className="font-mono text-slate-700">{selectedHub.activeIncidentNumber}</span>
              </div>
              <button
                onClick={() => navigate(`/client/query/${selectedHub.activeIncidentId}`)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1"
              >
                <span>Inspect Ticket</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
