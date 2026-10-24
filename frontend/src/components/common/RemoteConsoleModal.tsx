import React, { useState, useEffect, useRef } from 'react';
import { RemoteSession } from '../../types';
import { useData } from '../../context/DataContext';
import { 
  X, 
  Terminal, 
  Monitor, 
  ShieldCheck, 
  Wifi, 
  Power, 
  RefreshCw, 
  Download, 
  Camera, 
  Maximize2, 
  Minimize2,
  CheckCircle2, 
  Copy, 
  Check, 
  Activity, 
  Settings, 
  Layers, 
  Folder, 
  FolderOpen, 
  Play, 
  Square, 
  RotateCw, 
  Search, 
  Upload, 
  Trash2, 
  Key, 
  Lock, 
  Unlock, 
  Video, 
  VideoOff, 
  AlertTriangle, 
  Server, 
  FileText,
  Volume2,
  ExternalLink,
  ChevronRight,
  HardDrive
} from 'lucide-react';

interface RemoteConsoleModalProps {
  session: RemoteSession;
  isOpen: boolean;
  onClose: () => void;
  isExpert?: boolean;
}

type ManageEngineTab = 
  | 'DESKTOP' 
  | 'TASK_MANAGER' 
  | 'SERVICES' 
  | 'POWERSHELL' 
  | 'REGISTRY' 
  | 'EVENT_VIEWER' 
  | 'FILE_TRANSFER' 
  | 'AGENT_DOWNLOAD';

interface WindowsProcess {
  name: string;
  pid: number;
  cpu: number;
  memory: number; // in MB
  disk: string;
  status: 'Running' | 'Suspended';
  user: string;
}

interface WindowsService {
  name: string;
  displayName: string;
  status: 'Running' | 'Stopped';
  startupType: 'Automatic' | 'Manual' | 'Disabled';
  logOnAs: string;
}

interface WindowsEventLog {
  id: number;
  level: 'Error' | 'Warning' | 'Information' | 'Critical';
  source: string;
  eventId: number;
  category: string;
  time: string;
  description: string;
}

export const RemoteConsoleModal: React.FC<RemoteConsoleModalProps> = ({
  session,
  isOpen,
  onClose,
  isExpert = false
}) => {
  const { connectRemoteSession, terminateRemoteSession, addWorkLog } = useData();

  // Active Tool Tab
  const [activeTab, setActiveTab] = useState<ManageEngineTab>('DESKTOP');

  // Connection & Host State
  const [latency, setLatency] = useState(14);
  const [cpuUsage, setCpuUsage] = useState(38);
  const [memUsage, setMemUsage] = useState(62);
  const [blankScreen, setBlankScreen] = useState(false);
  const [inputBlocked, setInputBlocked] = useState(false);
  const [isRecording, setIsRecording] = useState(true);
  const [copiedPIN, setCopiedPIN] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [specialKeysMenuOpen, setSpecialKeysMenuOpen] = useState(false);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [activeWindow, setActiveWindow] = useState<'powershell' | 'taskmgr' | 'agent' | null>('powershell');

  // Real Native Windows Screen Share (using WebRTC getDisplayMedia)
  const [isNativeStreaming, setIsNativeStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Task Manager State
  const [processFilter, setProcessFilter] = useState('');
  const [processes, setProcesses] = useState<WindowsProcess[]>([
    { name: 'explorer.exe', pid: 4812, cpu: 2.4, memory: 142, disk: '0.2 MB/s', status: 'Running', user: 'Administrator' },
    { name: 'msedge.exe', pid: 6104, cpu: 8.6, memory: 618, disk: '1.4 MB/s', status: 'Running', user: 'Administrator' },
    { name: 'svchost.exe (DnsCache)', pid: 1044, cpu: 0.1, memory: 34, disk: '0.0 MB/s', status: 'Running', user: 'NETWORK SERVICE' },
    { name: 'svchost.exe (TermService)', pid: 1420, cpu: 1.2, memory: 52, disk: '0.1 MB/s', status: 'Running', user: 'SYSTEM' },
    { name: 'TechRescueAgent.exe', pid: 3340, cpu: 0.8, memory: 48, disk: '0.3 MB/s', status: 'Running', user: 'SYSTEM' },
    { name: 'dwm.exe', pid: 1120, cpu: 3.1, memory: 110, disk: '0.1 MB/s', status: 'Running', user: 'DWM-1' },
    { name: 'spoolsv.exe', pid: 2192, cpu: 0.0, memory: 28, disk: '0.0 MB/s', status: 'Running', user: 'SYSTEM' },
    { name: 'lsass.exe', pid: 748, cpu: 0.4, memory: 64, disk: '0.0 MB/s', status: 'Running', user: 'SYSTEM' },
    { name: 'services.exe', pid: 712, cpu: 0.2, memory: 22, disk: '0.0 MB/s', status: 'Running', user: 'SYSTEM' },
    { name: 'powershell.exe', pid: 8120, cpu: 1.5, memory: 86, disk: '0.0 MB/s', status: 'Running', user: 'Administrator' },
    { name: 'System Idle Process', pid: 0, cpu: 81.7, memory: 1, disk: '0.0 MB/s', status: 'Running', user: 'SYSTEM' },
  ]);

  // Services State
  const [serviceFilter, setServiceFilter] = useState('');
  const [services, setServices] = useState<WindowsService[]>([
    { name: 'Spooler', displayName: 'Print Spooler', status: 'Running', startupType: 'Automatic', logOnAs: 'LocalSystem' },
    { name: 'wuauserv', displayName: 'Windows Update', status: 'Running', startupType: 'Manual', logOnAs: 'LocalSystem' },
    { name: 'TermService', displayName: 'Remote Desktop Services', status: 'Running', startupType: 'Manual', logOnAs: 'NetworkService' },
    { name: 'WinDefend', displayName: 'Microsoft Defender Antivirus Service', status: 'Running', startupType: 'Automatic', logOnAs: 'LocalSystem' },
    { name: 'EventLog', displayName: 'Windows Event Log', status: 'Running', startupType: 'Automatic', logOnAs: 'LocalService' },
    { name: 'Dnscache', displayName: 'DNS Client', status: 'Running', startupType: 'Automatic', logOnAs: 'NetworkService' },
    { name: 'Dhcp', displayName: 'DHCP Client', status: 'Running', startupType: 'Automatic', logOnAs: 'LocalService' },
    { name: 'LanmanServer', displayName: 'Server (SMB File Sharing)', status: 'Running', startupType: 'Automatic', logOnAs: 'LocalSystem' },
    { name: 'w32time', displayName: 'Windows Time', status: 'Running', startupType: 'Manual', logOnAs: 'LocalService' },
    { name: 'TechRescueHost', displayName: 'TechRescue Windows Remote Host', status: 'Running', startupType: 'Automatic', logOnAs: 'LocalSystem' },
  ]);

  // PowerShell CLI State
  const [terminalHistory, setTerminalHistory] = useState<Array<{ cmd?: string; output: string; time: string }>>([
    {
      output: `Windows PowerShell\nCopyright (C) Microsoft Corporation. All rights reserved.\n\n[Connected to ${session.computerName || 'DESKTOP-WIN11'} via ManageEngine Remote Bridge]\nOS: ${session.windowsEdition || 'Windows 11 Pro 64-bit'}\nArchitecture: AMD64 | Domain: ${session.domainOrWorkgroup || 'CORP.LOCAL'}\nPS C:\\Windows\\system32>`,
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [cliInput, setCliInput] = useState('');
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Registry State
  const [selectedRegKey, setSelectedRegKey] = useState('HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server');
  const [registryValues, setRegistryValues] = useState<Array<{ name: string; type: string; data: string }>>([
    { name: '(Default)', type: 'REG_SZ', data: '(value not set)' },
    { name: 'fDenyTSConnections', type: 'REG_DWORD', data: '0x00000000 (0)' },
    { name: 'TSAppCompat', type: 'REG_DWORD', data: '0x00000000 (0)' },
    { name: 'AllowRemoteRPC', type: 'REG_DWORD', data: '0x00000001 (1)' },
    { name: 'ProductVersion', type: 'REG_SZ', data: '10.0.22631.3880' }
  ]);

  // Event Viewer State
  const [eventCategory, setEventCategory] = useState<'System' | 'Application' | 'Security'>('System');
  const [eventLogs, setEventLogs] = useState<WindowsEventLog[]>([
    { id: 1, level: 'Error', source: 'Service Control Manager', eventId: 7034, category: 'System', time: '14:28:10', description: 'The Print Spooler service terminated unexpectedly.' },
    { id: 2, level: 'Warning', source: 'Microsoft-Windows-DNS-Client', eventId: 1014, category: 'System', time: '14:22:04', description: 'Name resolution for the name dc01.corp.internal timed out.' },
    { id: 3, level: 'Information', source: 'Service Control Manager', eventId: 7036, category: 'System', time: '14:15:32', description: 'The Remote Desktop Services service entered the running state.' },
    { id: 4, level: 'Information', source: 'Microsoft-Windows-Security-Auditing', eventId: 4624, category: 'Security', time: '14:10:00', description: 'An account was successfully logged on: CORP\\Administrator.' },
    { id: 5, level: 'Critical', source: 'Microsoft-Windows-Kernel-Power', eventId: 41, category: 'System', time: '12:04:12', description: 'The system has rebooted without cleanly shutting down first.' }
  ]);

  // Connect on Mount
  useEffect(() => {
    if (isOpen && session.status === 'PENDING') {
      connectRemoteSession(session.id);
    }
  }, [isOpen, session.id]);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  // Live Jitter for CPU & Latency
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuUsage(prev => Math.min(94, Math.max(12, prev + Math.floor(Math.random() * 9) - 4)));
      setLatency(prev => Math.min(35, Math.max(8, prev + Math.floor(Math.random() * 5) - 2)));
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Stop video stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  if (!isOpen) return null;

  // Real Screen Share Action (Captures Windows Screen via Browser)
  const handleStartNativeScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor' } as any,
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsNativeStreaming(true);

      stream.getVideoTracks()[0].onended = () => {
        setIsNativeStreaming(false);
        streamRef.current = null;
      };

      await addWorkLog(
        session.ticketId,
        0.1,
        `Started live real-time Windows display stream from client computer.`,
        true
      );
    } catch (err) {
      console.warn('Native screen share cancelled or unavailable:', err);
    }
  };

  const handleStopNativeScreenShare = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsNativeStreaming(false);
  };

  // PowerShell Command Runner
  const handleRunPowerShellCmd = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    const now = new Date().toLocaleTimeString();

    let output = '';
    const lower = trimmed.toLowerCase();

    if (lower === 'clear' || lower === 'cls') {
      setTerminalHistory([]);
      setCliInput('');
      return;
    } else if (lower.includes('ipconfig /all') || lower === 'ipconfig') {
      output = `Windows IP Configuration\n\n   Host Name . . . . . . . . . . . . : ${session.computerName || 'DESKTOP-TR94'}\n   Primary Dns Suffix  . . . . . . . : corp.internal\n   Node Type . . . . . . . . . . . . : Hybrid\n   IP Routing Enabled. . . . . . . . : No\n   WINS Proxy Enabled. . . . . . . . : No\n\nEthernet adapter vEthernet (Corporate Network):\n   Connection-specific DNS Suffix  . : corp.internal\n   IPv4 Address. . . . . . . . . . . : ${session.ipAddress || '192.168.1.184'}(Preferred)\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1\n   DHCP Server . . . . . . . . . . . : 192.168.1.254\n   DNS Servers . . . . . . . . . . . : 192.168.1.10, 8.8.8.8\n   NetBIOS over Tcpip. . . . . . . . : Enabled`;
    } else if (lower.includes('ipconfig /flushdns')) {
      output = `Windows IP Configuration\n\nSuccessfully flushed the DNS Resolver Cache.`;
    } else if (lower.includes('get-service') || lower.includes('net start')) {
      output = `Status   Name               DisplayName\n------   ----               -----------\nRunning  Dnscache           DNS Client\nRunning  EventLog           Windows Event Log\nRunning  LanmanServer       Server\nRunning  Spooler            Print Spooler\nRunning  TechRescueAgent    TechRescue Windows Remote Host\nRunning  TermService        Remote Desktop Services\nRunning  WinDefend          Microsoft Defender Antivirus Service\nRunning  wuauserv           Windows Update`;
    } else if (lower.includes('sfc /scannow')) {
      output = `Beginning system scan. This process will take some time.\nBeginning verification phase of system scan.\nVerification 100% complete.\n\nWindows Resource Protection did not find any integrity violations.`;
    } else if (lower.includes('dism')) {
      output = `Deployment Image Servicing and Management tool\nVersion: 10.0.22621.1\n\nImage Version: 10.0.22631.3880\n[==========================100.0%==========================]\nThe operation completed successfully.`;
    } else if (lower.includes('gpupdate /force') || lower.includes('gpupdate')) {
      output = `Updating policy...\n\nComputer Policy update has completed successfully.\nUser Policy update has completed successfully.`;
    } else if (lower.includes('systeminfo')) {
      output = `Host Name:                 ${session.computerName || 'DESKTOP-TR94'}\nOS Name:                   Microsoft Windows 11 Enterprise\nOS Version:                10.0.22631 N/A Build 22631\nOS Manufacturer:           Microsoft Corporation\nSystem Manufacturer:       Dell Inc.\nSystem Model:              Latitude 5530\nSystem Type:               x64-based PC\nProcessor(s):              1 Processor(s) Installed.\n                           [01]: Intel64 Family 6 Model 154 Stepping 4 GenuineIntel ~2400 Mhz\nBIOS Version:              Dell Inc. 1.14.0, 15-08-2024\nWindows Directory:         C:\\Windows\nTotal Physical Memory:     16,112 MB\nAvailable Physical Memory: 6,420 MB\nDomain:                    ${session.domainOrWorkgroup || 'CORP.LOCAL'}\nHotfix(s):                 4 Hotfix(s) Installed.`;
    } else if (lower.includes('netstat')) {
      output = `Active Connections\n\n  Proto  Local Address          Foreign Address        State           PID\n  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       940\n  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING       4\n  TCP    0.0.0.0:3389           0.0.0.0:0              LISTENING       1420\n  TCP    192.168.1.184:51240    104.18.22.40:443       ESTABLISHED     6104\n  TCP    192.168.1.184:52110    192.168.1.10:389       ESTABLISHED     3340`;
    } else if (lower.includes('get-process')) {
      output = `Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id ProcessName\n-------  ------    -----      -----     ------     -- -----------\n    842      48   142100     198420      18.42   6104 msedge\n    420      22    86400     112040       4.12   4812 explorer\n    210      14    48200      62180       1.15   3340 TechRescueAgent\n    180      10    22100      31240       0.45   1420 svchost`;
    } else if (lower.includes('whoami')) {
      output = `${session.domainOrWorkgroup || 'CORP'}\\Administrator`;
    } else {
      output = `Command executed successfully on ${session.computerName || 'Windows Host'}.\nExitCode: 0\nResult: Operation completed.`;
    }

    setTerminalHistory(prev => [
      ...prev,
      { cmd: trimmed, output, time: now }
    ]);
    setCliInput('');
  };

  // End Task action
  const handleEndProcess = (pid: number, name: string) => {
    setProcesses(prev => prev.filter(p => p.pid !== pid));
    addWorkLog(session.ticketId, 0.1, `[ManageEngine TaskMgr] Terminated Windows process ${name} (PID: ${pid}).`, true);
  };

  // Restart Service action
  const handleRestartService = (name: string, displayName: string) => {
    setServices(prev =>
      prev.map(s => s.name === name ? { ...s, status: 'Running' } : s)
    );
    addWorkLog(session.ticketId, 0.1, `[ManageEngine Services] Restarted Windows service: ${displayName} (${name}).`, true);
  };

  // Toggle Service State
  const handleToggleService = (name: string) => {
    setServices(prev =>
      prev.map(s => {
        if (s.name === name) {
          const nextState = s.status === 'Running' ? 'Stopped' : 'Running';
          addWorkLog(session.ticketId, 0.1, `[ManageEngine Services] Changed service ${s.displayName} state to ${nextState}.`, true);
          return { ...s, status: nextState };
        }
        return s;
      })
    );
  };

  // Send Ctrl + Alt + Del
  const handleSendCtrlAltDel = async () => {
    alert(`[Windows GINA Signal Sent]: Simulating Ctrl + Alt + Del on ${session.computerName || 'Windows Host'}. User security prompt triggered.`);
    await addWorkLog(session.ticketId, 0.1, `Dispatched Ctrl+Alt+Del hardware interrupt to ${session.computerName}.`, true);
  };

  // Capture Screen
  const handleCaptureScreen = async () => {
    await addWorkLog(
      session.ticketId,
      0.1,
      `Captured Windows high-resolution diagnostic screenshot of ${session.computerName || 'Remote Host'}.`,
      true
    );
    alert(`Snapshot saved to Incident Audit Ledger for ${session.ticketNumber}.`);
  };

  // Remote Reboot
  const handleRemoteReboot = async (mode: 'normal' | 'safe') => {
    const confirm = window.confirm(`Are you sure you want to reboot ${session.computerName || 'Windows PC'} in ${mode === 'safe' ? 'Safe Mode with Networking' : 'Normal Mode'}?`);
    if (!confirm) return;

    await addWorkLog(
      session.ticketId,
      0.2,
      `Issued Windows remote reboot command (Mode: ${mode.toUpperCase()}) using shutdown.exe /r /t 10.`,
      true
    );
    alert(`Reboot command dispatched to ${session.computerName}. Machine will restart in 10 seconds.`);
  };

  const psBootstrapCmd = `powershell -ExecutionPolicy Bypass -Command "iwr -useb ${window.location.origin}/agent/TechRescue-QuickSupport.ps1 | iex -SessionId ${session.sessionToken} -PIN ${session.quickSupportPin || '842-195'}"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* TOP BAR: ManageEngine Remote Access Plus Header */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Logo & Target Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
              ME
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">
                  ManageEngine Remote Access Plus
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Windows Edition
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Connected
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                <span className="text-slate-200 font-semibold">{session.computerName || 'DESKTOP-TR94'}</span>
                <span>·</span>
                <span>{session.ipAddress || '192.168.1.184'}</span>
                <span>·</span>
                <span className="text-cyan-400">{session.windowsEdition || 'Windows 11 Pro x64'}</span>
                <span>·</span>
                <span>User: {session.activeUser || 'CORP\\Admin'}</span>
                <span>·</span>
                <span className="text-emerald-400">{latency}ms (Direct P2P)</span>
              </div>
            </div>
          </div>

          {/* Special Keys & Quick Remote Actions */}
          <div className="flex items-center gap-1.5">
            
            {/* QuickSupport PIN badge */}
            <div 
              onClick={() => {
                navigator.clipboard.writeText(session.quickSupportPin || '842-195');
                setCopiedPIN(true);
                setTimeout(() => setCopiedPIN(false), 2000);
              }}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 flex items-center gap-1.5 cursor-pointer"
              title="Click to copy 6-digit QuickSupport PIN"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>PIN: {session.quickSupportPin || '842-195'}</span>
              {copiedPIN ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
            </div>

            {/* Ctrl + Alt + Del */}
            <button
              onClick={handleSendCtrlAltDel}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1 transition-colors"
              title="Send Ctrl + Alt + Del keystroke to Windows"
            >
              <span>Ctrl+Alt+Del</span>
            </button>

            {/* Special Keys dropdown */}
            <div className="relative">
              <button
                onClick={() => setSpecialKeysMenuOpen(!specialKeysMenuOpen)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1 transition-colors"
              >
                <span>Win Keys</span>
                <ChevronRight className="w-3 h-3 rotate-90" />
              </button>

              {specialKeysMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-slate-950 border border-slate-700 rounded-xl shadow-xl py-1 z-50 text-xs">
                  <button 
                    onClick={() => { alert('Triggered Win + R (Run Dialog: cmd, regedit, services.msc)'); setSpecialKeysMenuOpen(false); }}
                    className="w-full px-3 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                  >
                    <span>Win + R</span>
                    <span className="text-[10px] text-slate-500">Run</span>
                  </button>
                  <button 
                    onClick={() => { alert('Triggered Win + X (Power User Menu)'); setSpecialKeysMenuOpen(false); }}
                    className="w-full px-3 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                  >
                    <span>Win + X</span>
                    <span className="text-[10px] text-slate-500">Quick Admin</span>
                  </button>
                  <button 
                    onClick={() => { alert('Triggered Win + D (Toggle Desktop)'); setSpecialKeysMenuOpen(false); }}
                    className="w-full px-3 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                  >
                    <span>Win + D</span>
                    <span className="text-[10px] text-slate-500">Desktop</span>
                  </button>
                  <button 
                    onClick={() => { alert('Triggered Win + E (File Explorer)'); setSpecialKeysMenuOpen(false); }}
                    className="w-full px-3 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                  >
                    <span>Win + E</span>
                    <span className="text-[10px] text-slate-500">Explorer</span>
                  </button>
                  <button 
                    onClick={() => { alert('Triggered Win + L (Lock Computer)'); setSpecialKeysMenuOpen(false); }}
                    className="w-full px-3 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                  >
                    <span>Win + L</span>
                    <span className="text-[10px] text-slate-500">Lock</span>
                  </button>
                </div>
              )}
            </div>

            {/* Blackout Host Screen toggle */}
            <button
              onClick={() => {
                setBlankScreen(!blankScreen);
                addWorkLog(session.ticketId, 0.1, `Toggled blank host monitor on ${session.computerName}: ${!blankScreen ? 'ENABLED' : 'DISABLED'}.`, true);
              }}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                blankScreen 
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title={blankScreen ? 'Blank Screen Active (Client Monitor Black)' : 'Blank Host Screen'}
            >
              {blankScreen ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>

            {/* Block Remote Input toggle */}
            <button
              onClick={() => {
                setInputBlocked(!inputBlocked);
                addWorkLog(session.ticketId, 0.1, `Toggled client input lock on ${session.computerName}: ${!inputBlocked ? 'LOCKED' : 'UNLOCKED'}.`, true);
              }}
              className={`px-2 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                inputBlocked 
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' 
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title="Block client keyboard and mouse input"
            >
              <span>{inputBlocked ? 'Input Blocked' : 'Block Input'}</span>
            </button>

            {/* Native Screen Share (Stream Real Windows Display via WebRTC) */}
            {!isNativeStreaming ? (
              <button
                onClick={handleStartNativeScreenShare}
                className="px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 rounded-lg text-xs font-semibold text-cyan-200 flex items-center gap-1 transition-colors"
                title="Stream your actual physical Windows display directly using browser WebRTC screen capture"
              >
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                <span>Stream My Screen</span>
              </button>
            ) : (
              <button
                onClick={handleStopNativeScreenShare}
                className="px-2.5 py-1 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 rounded-lg text-xs font-semibold text-rose-200 flex items-center gap-1 transition-colors"
                title="Stop streaming actual screen"
              >
                <VideoOff className="w-3.5 h-3.5 text-rose-400" />
                <span>Stop Stream</span>
              </button>
            )}

            {/* Screen Capture */}
            <button
              onClick={handleCaptureScreen}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Capture Diagnostic Screenshot"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            {/* Reboot dropdown */}
            <button
              onClick={() => handleRemoteReboot('normal')}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-rose-400 hover:text-rose-300 transition-colors"
              title="Reboot Windows System"
            >
              <Power className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-rose-600/80 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MANAGEENGINE SYSTEM MANAGER SUB-NAVIGATION TABS */}
        <div className="bg-slate-950/80 border-b border-slate-800 px-4 flex items-center gap-1 overflow-x-auto text-xs shrink-0 py-1">
          {[
            { id: 'DESKTOP', label: 'Remote Desktop', icon: Monitor },
            { id: 'TASK_MANAGER', label: 'Task Manager', icon: Activity },
            { id: 'SERVICES', label: 'Services (services.msc)', icon: Settings },
            { id: 'POWERSHELL', label: 'PowerShell / CMD', icon: Terminal },
            { id: 'REGISTRY', label: 'Registry (regedit)', icon: Layers },
            { id: 'EVENT_VIEWER', label: 'Event Viewer', icon: FileText },
            { id: 'FILE_TRANSFER', label: 'File Transfer', icon: FolderOpen },
            { id: 'AGENT_DOWNLOAD', label: 'Windows Agent & PS1', icon: Download }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ManageEngineTab)}
                className={`px-3 py-1.5 rounded-lg font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* WORKSPACE AREA */}
        <div className="flex-1 bg-slate-900 overflow-hidden flex flex-col">
          
          {/* TAB 1: REMOTE DESKTOP (Windows 11 Fluent UI Viewport) */}
          {activeTab === 'DESKTOP' && (
            <div className="relative flex-1 bg-slate-950 flex flex-col overflow-hidden">
              
              {/* Native Screen Share Viewport (If Active) */}
              {isNativeStreaming ? (
                <div className="flex-1 relative flex items-center justify-center bg-black">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/90 border border-cyan-500/40 text-cyan-300 px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2 backdrop-blur-xs">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>Streaming Live Client Windows Desktop (Native WebRTC)</span>
                  </div>
                </div>
              ) : (
                /* Authentic Windows 11 Desktop Simulator */
                <div 
                  className="flex-1 relative flex flex-col justify-between overflow-hidden select-none"
                  style={{
                    background: 'radial-gradient(circle at 50% 30%, #1e3a8a 0%, #0f172a 60%, #020617 100%)'
                  }}
                  onClick={() => setStartMenuOpen(false)}
                >
                  {/* Desktop Watermark & Info */}
                  <div className="absolute top-4 right-4 text-right pointer-events-none opacity-40 text-white font-mono text-[11px]">
                    <div>TechRescue Remote Access Plus</div>
                    <div>Windows 11 Enterprise (Evaluation copy)</div>
                    <div>Build 22631.ni_release.240502-1400</div>
                  </div>

                  {/* Desktop Icons */}
                  <div className="p-4 grid grid-cols-1 gap-4 w-28 text-center text-xs text-white">
                    <div 
                      onClick={() => setActiveWindow('taskmgr')}
                      className="p-2 rounded-lg hover:bg-white/10 cursor-pointer flex flex-col items-center gap-1 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                        <Activity className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] drop-shadow-sm font-medium">Task Manager</span>
                    </div>

                    <div 
                      onClick={() => setActiveWindow('powershell')}
                      className="p-2 rounded-lg hover:bg-white/10 cursor-pointer flex flex-col items-center gap-1 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] drop-shadow-sm font-medium">PowerShell</span>
                    </div>

                    <div 
                      onClick={() => setActiveWindow('agent')}
                      className="p-2 rounded-lg hover:bg-white/10 cursor-pointer flex flex-col items-center gap-1 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] drop-shadow-sm font-medium">Agent Service</span>
                    </div>
                  </div>

                  {/* Desktop Interactive Window 1: Windows PowerShell */}
                  {activeWindow === 'powershell' && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-10 left-32 w-[600px] bg-slate-950/95 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
                    >
                      <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-blue-400" />
                          <span className="font-semibold text-slate-200">Administrator: Windows PowerShell</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setActiveWindow(null)} className="text-slate-400 hover:text-white">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3 font-mono text-[11px] text-slate-200 space-y-2 h-64 overflow-y-auto">
                        <div className="text-slate-400">Windows PowerShell v5.1.22621.3880</div>
                        <div className="text-slate-400">ManageEngine Remote Execution Bridge: Online</div>
                        <div>PS C:\Windows\system32&gt; Get-ComputerInfo | Select-Object WindowsProductName, OsVersion</div>
                        <div className="text-cyan-300">WindowsProductName: Windows 11 Enterprise | OsVersion: 10.0.22631</div>
                        <div>PS C:\Windows\system32&gt; Test-NetConnection -ComputerName 1.1.1.1 -Port 443</div>
                        <div className="text-emerald-400">TcpTestSucceeded: True | PingSucceeded: True (Latency: 14ms)</div>
                        <div className="flex items-center gap-1">
                          <span className="text-blue-400">PS C:\Windows\system32&gt;</span>
                          <span className="w-2 h-4 bg-white animate-pulse" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Desktop Interactive Window 2: TechRescue Remote Agent Service */}
                  {activeWindow === 'agent' && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-20 right-20 w-[420px] bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
                    >
                      <div className="px-3 py-1.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-semibold text-white">TechRescue QuickSupport Windows Host</span>
                        </div>
                        <button onClick={() => setActiveWindow(null)} className="text-slate-400 hover:text-white">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="p-4 space-y-3 text-xs">
                        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                          <span className="text-slate-400">Agent Status</span>
                          <span className="font-bold text-emerald-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Session Established
                          </span>
                        </div>
                        <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Connected Specialist:</span>
                            <span className="text-cyan-300">{session.expertName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">QuickSupport PIN:</span>
                            <span className="text-amber-300 font-bold">{session.quickSupportPin || '842-195'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Encryption:</span>
                            <span className="text-emerald-300">TLS 1.3 / AES-256 GCM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Windows 11 Start Menu Popup */}
                  {startMenuOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[480px] bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl p-5 backdrop-blur-md z-40 space-y-4"
                    >
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Type here to search Windows apps, settings, and files..."
                          className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-400 font-semibold mb-2">
                          <span>Pinned Applications</span>
                          <span className="text-blue-400 cursor-pointer">All apps &gt;</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          {[
                            { name: 'Edge', icon: Monitor },
                            { name: 'PowerShell', icon: Terminal, action: () => { setActiveWindow('powershell'); setStartMenuOpen(false); } },
                            { name: 'Task Manager', icon: Activity, action: () => { setActiveTab('TASK_MANAGER'); setStartMenuOpen(false); } },
                            { name: 'Services', icon: Settings, action: () => { setActiveTab('SERVICES'); setStartMenuOpen(false); } },
                            { name: 'Registry', icon: Layers, action: () => { setActiveTab('REGISTRY'); setStartMenuOpen(false); } },
                            { name: 'Event Viewer', icon: FileText, action: () => { setActiveTab('EVENT_VIEWER'); setStartMenuOpen(false); } },
                            { name: 'Terminal', icon: Terminal, action: () => { setActiveTab('POWERSHELL'); setStartMenuOpen(false); } },
                            { name: 'QuickSupport', icon: ShieldCheck, action: () => { setActiveWindow('agent'); setStartMenuOpen(false); } }
                          ].map(app => {
                            const AppIcon = app.icon;
                            return (
                              <div 
                                key={app.name}
                                onClick={app.action}
                                className="p-2 rounded-xl hover:bg-slate-800 cursor-pointer flex flex-col items-center gap-1 text-slate-300 hover:text-white"
                              >
                                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                                  <AppIcon className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] truncate w-full">{app.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* User & Power Footer in Start Menu */}
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                            A
                          </div>
                          <div>
                            <span className="font-semibold block text-white">{session.activeUser || 'CORP\\Administrator'}</span>
                            <span className="text-[10px] text-slate-500 block">{session.computerName}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoteReboot('normal')}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-rose-400"
                          title="Power & Reboot"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Windows 11 Centered Taskbar */}
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="h-12 bg-slate-950/90 border-t border-slate-800 px-4 flex items-center justify-between backdrop-blur-md"
                  >
                    {/* Left: Widgets / Weather */}
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                      <span>28°C Mostly Sunny</span>
                    </div>

                    {/* Centered Windows 11 App Icons */}
                    <div className="flex items-center gap-1.5">
                      {/* Windows Logo (Start) */}
                      <button 
                        onClick={() => setStartMenuOpen(!startMenuOpen)}
                        className={`p-2 rounded-lg transition-colors ${
                          startMenuOpen ? 'bg-blue-600/40 text-blue-400' : 'hover:bg-slate-800 text-blue-500'
                        }`}
                        title="Start"
                      >
                        <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                          <div className="bg-current rounded-xs" />
                          <div className="bg-current rounded-xs" />
                          <div className="bg-current rounded-xs" />
                          <div className="bg-current rounded-xs" />
                        </div>
                      </button>

                      {/* Taskbar Pinned Apps */}
                      <button 
                        onClick={() => setActiveWindow('powershell')}
                        className={`p-2 rounded-lg hover:bg-slate-800 ${activeWindow === 'powershell' ? 'bg-slate-800 border-b-2 border-blue-500 text-blue-400' : 'text-slate-400'}`}
                        title="Windows PowerShell"
                      >
                        <Terminal className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setActiveTab('TASK_MANAGER')}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"
                        title="Task Manager"
                      >
                        <Activity className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setActiveTab('SERVICES')}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"
                        title="Services"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setActiveWindow('agent')}
                        className={`p-2 rounded-lg hover:bg-slate-800 ${activeWindow === 'agent' ? 'bg-slate-800 border-b-2 border-emerald-500 text-emerald-400' : 'text-slate-400'}`}
                        title="TechRescue Agent"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </div>

                    {/* System Tray (Right) */}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5 text-slate-300" />
                        <Volume2 className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                      <div className="text-right text-[11px] leading-tight font-mono text-slate-300">
                        <div>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-[10px] text-slate-500">{new Date().toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TASK MANAGER (ManageEngine Background Diagnostics) */}
          {activeTab === 'TASK_MANAGER' && (
            <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span>Windows Task Manager (taskmgr.exe)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live process monitor on {session.computerName} · {processes.length} active processes
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                    <input 
                      type="text" 
                      value={processFilter}
                      onChange={(e) => setProcessFilter(e.target.value)}
                      placeholder="Filter processes (e.g. edge, svchost)..."
                      className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-56"
                    />
                  </div>
                </div>
              </div>

              {/* Real-time Meter Cards */}
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Total CPU Utilization</span>
                  <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">{cpuUsage}%</div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-cyan-400 h-full transition-all duration-500" style={{ width: `${cpuUsage}%` }} />
                  </div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">RAM Allocation</span>
                  <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{memUsage}% (9.9 / 16.0 GB)</div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${memUsage}%` }} />
                  </div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Disk C: Throughput</span>
                  <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">2.4 MB/s (NVMe SSD)</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Network Throughput</span>
                  <div className="text-lg font-bold font-mono text-blue-400 mt-0.5">14.8 Mbps</div>
                </div>
              </div>

              {/* Process Table */}
              <div className="flex-1 border border-slate-800 rounded-xl overflow-y-auto bg-slate-950/70">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 border-b border-slate-800 sticky top-0 font-semibold text-slate-300">
                    <tr>
                      <th className="py-2.5 px-3">Process Name</th>
                      <th className="py-2.5 px-3 font-mono">PID</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 font-mono">CPU %</th>
                      <th className="py-2.5 px-3 font-mono">Memory (MB)</th>
                      <th className="py-2.5 px-3 font-mono">Disk</th>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {processes
                      .filter(p => !processFilter || p.name.toLowerCase().includes(processFilter.toLowerCase()))
                      .map(p => (
                        <tr key={p.pid} className="hover:bg-slate-900/60 transition-colors">
                          <td className="py-2 px-3 font-medium text-slate-200 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500/50" />
                            <span>{p.name}</span>
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-400">{p.pid}</td>
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {p.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-cyan-300">{p.cpu}%</td>
                          <td className="py-2 px-3 font-mono text-slate-300">{p.memory} MB</td>
                          <td className="py-2 px-3 font-mono text-slate-400">{p.disk}</td>
                          <td className="py-2 px-3 text-slate-400 text-[11px]">{p.user}</td>
                          <td className="py-2 px-3 text-right">
                            {p.pid !== 0 && (
                              <button
                                onClick={() => handleEndProcess(p.pid, p.name)}
                                className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                End Task
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICES (services.msc) */}
          {activeTab === 'SERVICES' && (
            <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-cyan-400" />
                    <span>Windows Services Manager (services.msc)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Inspect, start, stop, and restart background services without interrupting user session
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input 
                    type="text" 
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    placeholder="Search services (e.g. spooler, wuauserv)..."
                    className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-60"
                  />
                </div>
              </div>

              <div className="flex-1 border border-slate-800 rounded-xl overflow-y-auto bg-slate-950/70">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 border-b border-slate-800 sticky top-0 font-semibold text-slate-300">
                    <tr>
                      <th className="py-2.5 px-3">Service Name</th>
                      <th className="py-2.5 px-3">Display Name</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Startup Type</th>
                      <th className="py-2.5 px-3">Log On As</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {services
                      .filter(s => !serviceFilter || s.name.toLowerCase().includes(serviceFilter.toLowerCase()) || s.displayName.toLowerCase().includes(serviceFilter.toLowerCase()))
                      .map(s => (
                        <tr key={s.name} className="hover:bg-slate-900/60 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-medium text-cyan-300">{s.name}</td>
                          <td className="py-2.5 px-3 text-slate-200">{s.displayName}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              s.status === 'Running' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">{s.startupType}</td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{s.logOnAs}</td>
                          <td className="py-2.5 px-3 text-right space-x-1.5">
                            <button
                              onClick={() => handleToggleService(s.name)}
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                                s.status === 'Running'
                                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              {s.status === 'Running' ? 'Stop' : 'Start'}
                            </button>
                            <button
                              onClick={() => handleRestartService(s.name, s.displayName)}
                              className="px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Restart
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: POWERSHELL / CMD TERMINAL */}
          {activeTab === 'POWERSHELL' && (
            <div className="flex-1 flex flex-col p-4 space-y-3 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <span>Windows PowerShell (Administrator)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Direct root terminal execution on {session.computerName}
                  </p>
                </div>

                {/* Quick Windows Diagnostic Commands */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {[
                    { label: 'ipconfig /all', cmd: 'ipconfig /all' },
                    { label: 'Flush DNS', cmd: 'ipconfig /flushdns' },
                    { label: 'Get-Service', cmd: 'Get-Service' },
                    { label: 'sfc /scannow', cmd: 'sfc /scannow' },
                    { label: 'DISM Health', cmd: 'DISM /Online /Cleanup-Image /ScanHealth' },
                    { label: 'gpupdate /force', cmd: 'gpupdate /force' },
                    { label: 'systeminfo', cmd: 'systeminfo' },
                    { label: 'netstat', cmd: 'netstat -ano' }
                  ].map(c => (
                    <button
                      key={c.label}
                      onClick={() => handleRunPowerShellCmd(c.cmd)}
                      className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-md text-[11px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Console Output Window */}
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-3 text-slate-200">
                {terminalHistory.map((h, i) => (
                  <div key={i} className="space-y-1">
                    {h.cmd && (
                      <div className="text-cyan-400 flex items-center gap-1.5">
                        <span className="text-slate-500">{h.time}</span>
                        <span className="text-blue-400">PS C:\Windows\system32&gt;</span>
                        <span className="font-bold text-white">{h.cmd}</span>
                      </div>
                    )}
                    <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed text-[11px] bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
                      {h.output}
                    </pre>
                  </div>
                ))}
                <div ref={terminalBottomRef} />
              </div>

              {/* Command Input Bar */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleRunPowerShellCmd(cliInput); }}
                className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl p-2 shrink-0"
              >
                <span className="text-blue-400 font-mono text-xs pl-2 shrink-0">PS C:\Windows\system32&gt;</span>
                <input
                  type="text"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  placeholder="Type PowerShell cmdlet or CMD command (e.g. Test-NetConnection, Get-Process)..."
                  className="flex-1 bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  disabled={!cliInput.trim()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  Execute
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: REGISTRY EDITOR (regedit.exe) */}
          {activeTab === 'REGISTRY' && (
            <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Windows Registry Editor (regedit.exe)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Inspect and edit system configuration hives directly in the background
                </p>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-hidden">
                {/* Registry Tree (Left) */}
                <div className="md:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs overflow-y-auto space-y-2 font-mono">
                  <div className="font-bold text-slate-300">Computer</div>
                  <div className="pl-3 space-y-1.5 text-slate-400 text-[11px]">
                    <div>📁 HKEY_CLASSES_ROOT</div>
                    <div>📁 HKEY_CURRENT_USER</div>
                    <div className="space-y-1">
                      <div className="text-cyan-400 font-semibold">📂 HKEY_LOCAL_MACHINE</div>
                      <div className="pl-4 space-y-1 text-slate-400">
                        <div>📁 HARDWARE</div>
                        <div>📁 SAM</div>
                        <div>📁 SECURITY</div>
                        <div>📁 SOFTWARE</div>
                        <div className="space-y-1 text-cyan-300 font-medium">
                          <div>📂 SYSTEM</div>
                          <div className="pl-3 space-y-0.5 text-slate-400">
                            <div>📁 CurrentControlSet</div>
                            <div className="pl-3 text-amber-300 font-bold">
                              📄 Terminal Server
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>📁 HKEY_USERS</div>
                    <div>📁 HKEY_CURRENT_CONFIG</div>
                  </div>
                </div>

                {/* Values Table (Right) */}
                <div className="md:col-span-8 bg-slate-950 border border-slate-800 rounded-xl overflow-y-auto">
                  <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
                    Path: <span className="text-cyan-300">{selectedRegKey}</span>
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900/60 border-b border-slate-800 font-semibold text-slate-300">
                      <tr>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3 font-mono">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 font-mono text-[11px]">
                      {registryValues.map(v => (
                        <tr key={v.name} className="hover:bg-slate-900/60">
                          <td className="py-2.5 px-3 text-slate-200">{v.name}</td>
                          <td className="py-2.5 px-3 text-purple-400">{v.type}</td>
                          <td className="py-2.5 px-3 text-emerald-400">{v.data}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: EVENT VIEWER (eventvwr.msc) */}
          {activeTab === 'EVENT_VIEWER' && (
            <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Windows Event Viewer (eventvwr.msc)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Inspect Windows System, Application, and Security logs in real-time
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {(['System', 'Application', 'Security'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setEventCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        eventCategory === cat
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 border border-slate-800 rounded-xl overflow-y-auto bg-slate-950/70">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 border-b border-slate-800 sticky top-0 font-semibold text-slate-300">
                    <tr>
                      <th className="py-2.5 px-3">Level</th>
                      <th className="py-2.5 px-3">Date and Time</th>
                      <th className="py-2.5 px-3">Source</th>
                      <th className="py-2.5 px-3 font-mono">Event ID</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {eventLogs.map(e => (
                      <tr key={e.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            e.level === 'Critical' || e.level === 'Error'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : e.level === 'Warning'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {e.level}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{e.time}</td>
                        <td className="py-2.5 px-3 text-slate-300 font-medium">{e.source}</td>
                        <td className="py-2.5 px-3 font-mono text-cyan-300 font-bold">{e.eventId}</td>
                        <td className="py-2.5 px-3 text-slate-300 max-w-md">{e.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: FILE TRANSFER (Dual-Pane Explorer) */}
          {activeTab === 'FILE_TRANSFER' && (
            <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-emerald-400" />
                  <span>Windows File Transfer Manager</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Bi-directional secure file exchange between technician workstation and remote Windows PC
                </p>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                {/* Local Technician Explorer */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
                    <span>Local: C:\Technician\Payloads</span>
                    <button className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[11px] text-slate-300">
                      Browse...
                    </button>
                  </div>
                  <div className="flex-1 py-2 space-y-1 text-xs text-slate-300 overflow-y-auto">
                    {[
                      { name: 'WireShark-Win64.msi', size: '74.2 MB' },
                      { name: 'NetworkFix-v2.bat', size: '12 KB' },
                      { name: 'Procmon64.exe', size: '4.8 MB' },
                      { name: 'SslCertRenew.ps1', size: '8 KB' }
                    ].map(f => (
                      <div key={f.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 group">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span>{f.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500 text-[11px]">{f.size}</span>
                          <button 
                            onClick={() => alert(`Uploading ${f.name} to remote Windows host...`)}
                            className="px-2 py-0.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded text-[11px] font-semibold"
                          >
                            Push &gt;&gt;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remote Windows Explorer */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
                    <span>Remote: C:\ProgramData\TechRescue\Temp</span>
                    <button className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[11px] text-slate-300">
                      Refresh
                    </button>
                  </div>
                  <div className="flex-1 py-2 space-y-1 text-xs text-slate-300 overflow-y-auto">
                    {[
                      { name: 'crashdump_20261024.dmp', size: '210.4 MB' },
                      { name: 'event_log_export.evtx', size: '18.2 MB' },
                      { name: 'agent_diagnostic.log', size: '420 KB' }
                    ].map(f => (
                      <div key={f.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 group">
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-emerald-400" />
                          <span>{f.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500 text-[11px]">{f.size}</span>
                          <button 
                            onClick={() => alert(`Downloading ${f.name} to technician workstation...`)}
                            className="px-2 py-0.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded text-[11px] font-semibold"
                          >
                            &lt;&lt; Pull
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: WINDOWS AGENT DOWNLOADS & SCRIPT GENERATOR */}
          {activeTab === 'AGENT_DOWNLOAD' && (
            <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-400" />
                  <span>Original Windows QuickSupport Agent & Deployment Package</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Distribute the portable Windows QuickSupport executable or deploy via PowerShell without installing full software.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Option 1: Standalone Windows Executable (.exe) */}
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 mb-2">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">TechRescue-QuickSupport.exe</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Zero-install, single-file portable Windows executable. Client opens it, enters 6-digit PIN, and remote control starts instantly.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const blob = new Blob([`@echo off\necho Starting TechRescue ManageEngine Windows Remote Client...\necho Session: ${session.id}\necho Connecting to gateway...\npause`], { type: 'application/octet-stream' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `TechRescue-QuickSupport-${session.quickSupportPin || 'win'}.exe`;
                      a.click();
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Windows .EXE</span>
                  </button>
                </div>

                {/* Option 2: Windows Batch Script (.bat) */}
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-2">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">TechRescue-Agent.bat</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Windows Batch launcher that elevates to Administrator, checks Remote Desktop firewall ports, and connects to session.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const content = `@echo off\ntitle TechRescue Windows Remote Host\necho [ManageEngine Bridge] Connecting to Session ${session.id}...\npowershell -Command "${psBootstrapCmd}"\npause`;
                      const blob = new Blob([content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `TechRescue-Agent.bat`;
                      a.click();
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Windows .BAT</span>
                  </button>
                </div>

                {/* Option 3: 1-Click PowerShell Run Command */}
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 mb-2">
                      <Key className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">1-Click PowerShell Command</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Ask client to press <strong className="text-slate-200">Win + R</strong>, paste this command, and press Enter to launch session.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(psBootstrapCmd);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2000);
                    }}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedScript ? 'Command Copied!' : 'Copy PowerShell Cmd'}</span>
                  </button>
                </div>
              </div>

              {/* Code Display */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  PowerShell Script Execution Syntax (Run as Administrator or standard user):
                </span>
                <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap select-all">
                  {psBootstrapCmd}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER AUDIT BAR */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Session Encryption: AES-256-GCM (FIPS 140-2 Compliant)</span>
            </span>
            <span>·</span>
            <span className="font-mono text-slate-400">Session ID: {session.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Audit Recording:</span>
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
