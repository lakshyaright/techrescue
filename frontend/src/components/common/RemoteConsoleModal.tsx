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
  Play,
  Copy,
  Server
} from 'lucide-react';

interface RemoteConsoleModalProps {
  session: RemoteSession;
  isOpen: boolean;
  onClose: () => void;
  isExpert?: boolean;
}

export const RemoteConsoleModal: React.FC<RemoteConsoleModalProps> = ({
  session,
  isOpen,
  onClose,
  isExpert = false
}) => {
  const { connectRemoteSession, terminateRemoteSession, addWorkLog } = useData();

  const [activeMode, setActiveMode] = useState<'DESKTOP' | 'TERMINAL'>('TERMINAL');
  const [terminalHistory, setTerminalHistory] = useState<Array<{ cmd?: string; output: string; time: string }>>([
    {
      output: `[CONNECTED] Secure WebRTC DataChannel established to ${session.targetHostname || 'srv-datacenter-01'}.\nProtocol: TLS 1.3 / AES-256-GCM. Latency: 14ms (Direct P2P).\nRemote OS: ${session.osInfo || 'Ubuntu 24.04 LTS (x86_64)'}.\nType 'help' or click quick diagnostic commands below.`,
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [cpuUsage, setCpuUsage] = useState(38);
  const [memUsage, setMemUsage] = useState(6.2);
  const [screenshotTaken, setScreenshotTaken] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && session.status === 'PENDING') {
      connectRemoteSession(session.id);
    }
  }, [isOpen, session.id]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  // Simulate real-time CPU jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.min(95, Math.max(15, prev + Math.floor(Math.random() * 11) - 5)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const handleCommandRun = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    let response = '';
    const now = new Date().toLocaleTimeString();

    if (trimmed === 'help') {
      response = `Available Diagnostic Commands:\n  systemctl status nginx     - Check web application service state\n  netstat -tuln              - List active listening TCP/UDP ports\n  top -b -n 1                - Inspect CPU & process load snapshot\n  ping -c 4 8.8.8.8          - Test upstream gateway ICMP connectivity\n  df -h                      - Check disk space & mounted volumes\n  docker ps                  - Check container health & uptime\n  clear                      - Clear terminal display buffer`;
    } else if (trimmed === 'clear') {
      setTerminalHistory([]);
      setCurrentInput('');
      return;
    } else if (trimmed.includes('systemctl')) {
      response = `● nginx.service - A high performance web server and reverse proxy\n   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)\n   Active: active (running) since Thu 2026-10-24 09:12:04 UTC; 4h 21min ago\n  Process: 1842 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)\n Main PID: 1843 (nginx)\n    Tasks: 4 (limit: 18984)\n   Memory: 48.2M (peak: 56.4M)\n      CPU: 4.812s\n   CGroup: /system.slice/nginx.service\n           ├─1843 "nginx: master process /usr/sbin/nginx -g daemon on;"\n           └─1844 "nginx: worker process"`;
    } else if (trimmed.includes('netstat')) {
      response = `Active Internet connections (only servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State\ntcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN\ntcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN\ntcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN\ntcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN\ntcp6       0      0 :::22                   :::*                    LISTEN\ntcp6       0      0 :::443                  :::*                    LISTEN`;
    } else if (trimmed.includes('ping')) {
      response = `PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.\n64 bytes from 8.8.8.8: icmp_seq=1 ttl=116 time=11.2 ms\n64 bytes from 8.8.8.8: icmp_seq=2 ttl=116 time=11.8 ms\n64 bytes from 8.8.8.8: icmp_seq=3 ttl=116 time=10.9 ms\n64 bytes from 8.8.8.8: icmp_seq=4 ttl=116 time=11.4 ms\n\n--- 8.8.8.8 ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss, time 3004ms\nrtt min/avg/max/mdev = 10.912/11.325/11.840/0.334 ms`;
    } else if (trimmed.includes('top')) {
      response = `top - 12:45:10 up 48 days,  3:14,  2 users,  load average: 0.42, 0.58, 0.65\nTasks: 182 total,   1 running, 181 sleeping,   0 stopped,   0 zombie\n%Cpu(s):  ${cpuUsage}.2 us,  4.1 sy,  0.0 ni, 68.4 id,  1.1 wa,  0.0 hi,  0.2 si\nMiB Mem :  16048.2 total,   4210.4 free,   ${Math.round(memUsage * 1024)}.0 used,   5214.8 buff/cache\n\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n 1843 root      20   0  148520  48210  12400 S  18.4   0.3   1:12.44 nginx\n 2410 postgres  20   0 1489240 421800  98200 S  12.2   2.6  14:52.18 postgres\n 3104 root      20   0  984210 184200  42100 S   4.8   1.1   0:44.12 node`;
    } else if (trimmed.includes('docker')) {
      response = `CONTAINER ID   IMAGE                 COMMAND                  CREATED        STATUS        PORTS                               NAMES\na8f102c914e1   redis:7-alpine        "docker-entrypoint.s…"   2 days ago     Up 2 days     0.0.0.0:6379->6379/tcp              redis-cache\n5b9021eef014   postgres:16-alpine    "docker-entrypoint.s…"   5 days ago     Up 5 days     0.0.0.0:5432->5432/tcp              app-db-master`;
    } else if (trimmed.includes('df')) {
      response = `Filesystem     1K-blocks      Used Available Use% Mounted on\nudev             8173420         0   8173420   0% /dev\ntmpfs            1638210      2412   1635798   1% /run\n/dev/sda1      101902400  42180420  59721980  42% /\ntmpfs            8191050         0   8191050   0% /dev/shm`;
    } else {
      response = `Executing '${trimmed}'...\nExit Code: 0 (OK)\nCommand completed successfully.`;
    }

    setTerminalHistory(prev => [
      ...prev,
      { cmd: trimmed, output: response, time: now }
    ]);
    setCurrentInput('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(session.accessUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCaptureScreenshot = async () => {
    setScreenshotTaken(true);
    await addWorkLog(
      session.ticketId,
      0.1,
      `Captured live remote screen diagnostic snapshot during active support session.`,
      true
    );
    setTimeout(() => setScreenshotTaken(false), 2500);
  };

  const handleTerminate = async () => {
    await terminateRemoteSession(session.id);
    await addWorkLog(
      session.ticketId,
      0.2,
      `Terminated remote assistance session (${session.protocol}). Clean session teardown recorded.`,
      false
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Remote Session Control Bar */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  {session.id}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE CONNECTED
                </span>
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                  {session.ticketNumber}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Target: <strong>{session.targetHostname || 'srv-datacenter-01'}</strong></span>
                <span>·</span>
                <span className="text-emerald-400">14ms latency</span>
                <span>·</span>
                <span className="text-blue-400">TLS 1.3 / 256-bit AES</span>
              </div>
            </div>
          </div>

          {/* Mode Switcher & Tools */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setActiveMode('TERMINAL')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'TERMINAL' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Shell CLI</span>
              </button>
              <button
                onClick={() => setActiveMode('DESKTOP')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'DESKTOP' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Remote GUI</span>
              </button>
            </div>

            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              title="Copy Client Remote Invite Link"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleCaptureScreenshot}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              title="Capture Diagnostic Snapshot"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">{screenshotTaken ? 'Saved!' : 'Snapshot'}</span>
            </button>

            <button
              onClick={handleTerminate}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="End and Terminate Remote Session"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Content */}
        <div className="flex-1 bg-slate-950 p-4 overflow-hidden flex flex-col font-mono">
          
          {/* TERMINAL VIEW */}
          {activeMode === 'TERMINAL' && (
            <div className="flex-1 flex flex-col bg-black rounded-xl border border-slate-800 overflow-hidden shadow-inner">
              {/* Terminal Window Header */}
              <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 font-mono text-slate-300 text-[11px]">
                    root@{session.targetHostname || 'srv-datacenter-01'}:~
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span>CPU: <strong className="text-emerald-400">{cpuUsage}%</strong></span>
                  <span>RAM: <strong className="text-blue-400">{memUsage} GB / 16 GB</strong></span>
                </div>
              </div>

              {/* Terminal Output Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs leading-relaxed font-mono select-text">
                {terminalHistory.map((h, i) => (
                  <div key={i} className="space-y-1">
                    {h.cmd && (
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <span className="text-slate-500">[{h.time}]</span>
                        <span>root@{session.targetHostname || 'srv-datacenter-01'}:~#</span>
                        <span className="text-white">{h.cmd}</span>
                      </div>
                    )}
                    <pre className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap pl-2 bg-slate-950/40 py-1 rounded">
                      {h.output}
                    </pre>
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Quick Diagnostic Macro Buttons */}
              <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex flex-wrap gap-2 text-xs">
                <span className="text-[11px] text-slate-400 self-center font-sans font-medium mr-1">
                  Diagnostics:
                </span>
                <button
                  type="button"
                  onClick={() => handleCommandRun('systemctl status nginx')}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 cursor-pointer font-mono text-[11px]"
                >
                  systemctl status nginx
                </button>
                <button
                  type="button"
                  onClick={() => handleCommandRun('netstat -tuln')}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 cursor-pointer font-mono text-[11px]"
                >
                  netstat -tuln
                </button>
                <button
                  type="button"
                  onClick={() => handleCommandRun('ping -c 4 8.8.8.8')}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 cursor-pointer font-mono text-[11px]"
                >
                  ping -c 4 8.8.8.8
                </button>
                <button
                  type="button"
                  onClick={() => handleCommandRun('top -b -n 1')}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 cursor-pointer font-mono text-[11px]"
                >
                  top
                </button>
                <button
                  type="button"
                  onClick={() => handleCommandRun('docker ps')}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 cursor-pointer font-mono text-[11px]"
                >
                  docker ps
                </button>
                <button
                  type="button"
                  onClick={() => handleCommandRun('df -h')}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 cursor-pointer font-mono text-[11px]"
                >
                  df -h
                </button>
              </div>

              {/* Terminal Command Input Prompt */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCommandRun(currentInput);
                }}
                className="p-3 bg-black border-t border-slate-800 flex items-center gap-2"
              >
                <span className="text-emerald-400 font-bold shrink-0 text-xs">
                  root@{session.targetHostname || 'srv-datacenter-01'}:~#
                </span>
                <input
                  type="text"
                  autoFocus
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Type remote shell command or 'help'..."
                  className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none caret-emerald-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Run
                </button>
              </form>
            </div>
          )}

          {/* DESKTOP GUI VIEW */}
          {activeMode === 'DESKTOP' && (
            <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between shadow-inner">
              
              {/* Simulated Desktop Top Panel */}
              <div className="h-7 bg-slate-950/80 border-b border-slate-800/80 px-3 flex items-center justify-between text-[11px] text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">Activities</span>
                  <span>Terminal</span>
                  <span>System Monitor</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span>{new Date().toLocaleTimeString()}</span>
                  <span className="text-emerald-400">● 60 FPS</span>
                  <span className="text-slate-400">1920x1080</span>
                </div>
              </div>

              {/* Desktop Wallpaper with Open Windows */}
              <div className="flex-1 p-6 relative">
                {/* Floating System Window */}
                <div className="max-w-md w-full bg-slate-900/90 border border-slate-700 rounded-xl shadow-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 font-sans">
                      <Monitor className="w-3.5 h-3.5 text-blue-400" />
                      Live Server Environment
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Active Mirror
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Host:</span>
                      <span className="font-bold text-white font-mono">{session.targetHostname || 'prod-srv-01'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Operating System:</span>
                      <span className="text-slate-200">{session.osInfo || 'Ubuntu 24.04 LTS'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">CPU Activity:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${cpuUsage}%` }} />
                        </div>
                        <span className="font-mono text-slate-200">{cpuUsage}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">RAM Allocation:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '38%' }} />
                        </div>
                        <span className="font-mono text-slate-200">{memUsage} GB</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                    <span>Assigned Specialist:</span>
                    <strong className="text-white">{session.expertName}</strong>
                  </div>
                </div>
              </div>

              {/* Simulated Desktop Bottom Dock */}
              <div className="h-10 bg-slate-950/90 border-t border-slate-800 px-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400 font-sans">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>256-bit Encrypted Mirror Channel</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveMode('TERMINAL')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-sans text-[11px] cursor-pointer"
                  >
                    Open Shell Terminal
                  </button>
                  <button
                    onClick={handleCaptureScreenshot}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-sans text-[11px] cursor-pointer"
                  >
                    Take Snapshot
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
