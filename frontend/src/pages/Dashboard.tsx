import { useState, useEffect, useRef } from 'react'
import { Terminal, Cpu, HardDrive, Activity, X, CheckCircle, Server, DollarSign, MemoryStick } from 'lucide-react'
import { gpus } from '../data/gpus'

type Instance = {
  id: string
  name: string
  gpu: string
  os: string
  status: 'Running' | 'Pending' | 'Terminated'
  startedAt: number
  pricePerHour: number
}

const STORAGE_KEY = 'kubex_instances_v2'

const defaultInstances: Instance[] = [
  {
    id: 'inst-a1b2c3', name: 'training-run-01', gpu: 'RTX 4090',
    os: 'Ubuntu 24.04 LTS', status: 'Running',
    startedAt: Date.now() - 1000 * 60 * 134, pricePerHour: 1.49,
  },
  {
    id: 'inst-d4e5f6', name: 'inference-prod', gpu: 'RTX PRO 6000 Blackwell',
    os: 'Rocky Linux 9.7', status: 'Running',
    startedAt: Date.now() - 1000 * 60 * 60 * 18, pricePerHour: 3.29,
  },
]

function loadInstances(): Instance[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultInstances
    return JSON.parse(saved)
  } catch {
    return defaultInstances
  }
}

function formatUptime(startedAt: number): string {
  const ms = Date.now() - startedAt
  const s  = Math.floor(ms / 1000)
  const m  = Math.floor(s / 60)
  const h  = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}m`
  return `${m}m`
}

function calcCost(startedAt: number, pricePerHour: number): string {
  const hrs = (Date.now() - startedAt) / 3_600_000
  return `$${(hrs * pricePerHour).toFixed(2)}`
}

export default function Dashboard() {
  const [instances, setInstances] = useState<Instance[]>(loadInstances)
  const [deploying, setDeploying]   = useState(false)
  const [deployed, setDeployed]     = useState(false)
  const [selectedGPU, setSelectedGPU] = useState(gpus[0].id)
  const [instanceName, setInstanceName] = useState('')
  const [selectedOS, setSelectedOS] = useState('Ubuntu 24.04 LTS')
  const [tick, setTick] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setTick(t => t + 1), 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(instances))
  }, [instances])

  function handleDeploy() {
    if (!instanceName.trim()) return
    setDeploying(true)
    setTimeout(() => {
      const gpu = gpus.find(g => g.id === selectedGPU)!
      setInstances(prev => [{
        id: `inst-${Math.random().toString(36).slice(2, 8)}`,
        name: instanceName.trim(),
        gpu: gpu.gpu,
        os: selectedOS,
        status: 'Running',
        startedAt: Date.now(),
        pricePerHour: gpu.pricePerHour,
      }, ...prev])
      setDeploying(false)
      setDeployed(true)
      setInstanceName('')
      setTimeout(() => setDeployed(false), 3000)
    }, 2000)
  }

  function handleTerminate(id: string) {
    setInstances(prev => prev.filter(i => i.id !== id))
  }

  const running = instances.filter(i => i.status === 'Running')
  const totalCostToday = running.reduce((acc, i) => {
    const hrs = (Date.now() - i.startedAt) / 3_600_000
    return acc + hrs * i.pricePerHour
  }, 0)

  void tick

  return (
    <div className="min-h-screen bg-bg-base">

      {/* Page hero */}
      <section className="pt-24 pb-8 px-6 border-b border-border-subtle">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
          <div>
            <p className="section-label mb-1">Console</p>
            <h1 className="font-heading font-bold text-3xl text-text-primary">Dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'rgx-cluster' },
              { label: 'Longhorn' },
              { label: 'Prometheus' },
            ].map(c => (
              <div key={c.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border-subtle bg-bg-surface text-xs">
                <span className="status-dot" />
                <span className="text-text-secondary">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Server size={15} className="text-accent-green" />,    label: 'Running',      value: running.length.toString() },
            { icon: <Cpu size={15} className="text-accent-green" />,       label: 'vCPUs Used',   value: '96 / 288' },
            { icon: <HardDrive size={15} className="text-accent-green" />, label: 'Storage',      value: '3.2 / 10 TB' },
            { icon: <DollarSign size={15} className="text-accent-green" />,label: "Today's Cost", value: `$${totalCostToday.toFixed(2)}` },
          ].map(s => (
            <div key={s.label} className="p-5 rounded-2xl border border-border-subtle bg-bg-surface hover:border-border-default transition-all">
              <div className="flex items-center gap-2 mb-3 text-text-muted">
                {s.icon}
                <span className="text-xs">{s.label}</span>
              </div>
              <div className="font-heading font-bold text-2xl text-text-primary">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl border border-border-subtle bg-bg-surface">
              <div className="flex items-center gap-2 mb-6">
                <Terminal size={15} className="text-accent-green" />
                <span className="font-heading font-semibold text-sm text-text-primary">Launch Instance</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-text-muted block mb-1.5" htmlFor="instance-name">Instance Name</label>
                  <input
                    id="instance-name"
                    type="text"
                    value={instanceName}
                    onChange={e => setInstanceName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleDeploy()}
                    placeholder="my-training-run"
                    className="input-base"
                  />
                </div>

                <div>
                  <label className="text-xs text-text-muted block mb-1.5">GPU Tier</label>
                  <div className="space-y-2">
                    {gpus.map(gpu => (
                      <button
                        key={gpu.id}
                        onClick={() => setSelectedGPU(gpu.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                          selectedGPU === gpu.id
                            ? 'border-accent-green bg-accent-light'
                            : 'border-border-subtle hover:border-border-default bg-bg-elevated'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-text-primary">{gpu.gpu}</p>
                            <p className="text-xs text-text-muted">{gpu.vram} GB vRAM</p>
                          </div>
                          <span className="text-sm font-semibold text-accent-green">${gpu.pricePerHour}/hr</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-muted block mb-1.5" htmlFor="os-select">OS Image</label>
                  <select
                    id="os-select"
                    value={selectedOS}
                    onChange={e => setSelectedOS(e.target.value)}
                    className="input-base appearance-none cursor-pointer"
                  >
                    <option>Ubuntu 24.04 LTS</option>
                    <option>Rocky Linux 9.7</option>
                  </select>
                </div>

                <button
                  onClick={handleDeploy}
                  disabled={deploying || !instanceName.trim()}
                  className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deploying ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Provisioning...
                    </span>
                  ) : deployed ? (
                    <span className="flex items-center gap-2"><CheckCircle size={14} /> Deployed!</span>
                  ) : 'Deploy Instance'}
                </button>
              </div>
            </div>

            {/* Cluster nodes */}
            <div className="p-5 rounded-2xl border border-border-subtle bg-bg-surface">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-5">Cluster Nodes</p>
              <div className="space-y-4">
                {[
                  { label: 'rgx-node-01', ip: '10.10.30.10', role: 'control-plane' },
                  { label: 'rgx-node-02', ip: '10.10.30.11', role: 'worker' },
                  { label: 'rgx-node-03', ip: '10.10.30.12', role: 'worker' },
                ].map(node => (
                  <div key={node.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{node.label}</p>
                      <p className="font-mono text-xs text-text-muted">{node.ip}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="status-dot" />
                        <span className="text-xs text-accent-green font-medium">Ready</span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">{node.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Instances table */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border-subtle bg-bg-surface overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <Activity size={15} className="text-accent-green" />
                  <span className="font-heading font-semibold text-sm text-text-primary">Active Instances</span>
                </div>
                <span className="text-xs text-text-muted">{running.length} running</span>
              </div>

              <div className="hidden md:grid px-6 py-2.5 border-b border-border-subtle bg-bg-elevated"
                   style={{ gridTemplateColumns: '1fr 150px 80px 90px 70px' }}>
                {['Instance', 'GPU', 'Uptime', 'Cost', 'Status'].map(h => (
                  <span key={h} className="text-xs text-text-muted font-medium">{h}</span>
                ))}
              </div>

              <div className="divide-y divide-border-subtle">
                {instances.length === 0 && (
                  <div className="px-6 py-16 text-center">
                    <MemoryStick size={32} className="text-text-dim mx-auto mb-3" />
                    <p className="text-sm text-text-muted">No instances running.</p>
                    <p className="text-xs text-text-muted mt-1">Deploy one to get started.</p>
                  </div>
                )}
                {instances.map(inst => (
                  <div
                    key={inst.id}
                    className="hidden md:grid items-center px-6 py-4 hover:bg-bg-elevated transition-colors"
                    style={{ gridTemplateColumns: '1fr 150px 80px 90px 70px' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        inst.status === 'Running' ? 'bg-accent-green animate-pulse' :
                        inst.status === 'Pending' ? 'bg-yellow-400 animate-pulse' :
                        'bg-border-default'
                      }`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{inst.name}</p>
                        <p className="font-mono text-xs text-text-muted">{inst.id}</p>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary truncate pr-2">{inst.gpu}</p>
                    <p className="text-xs text-text-primary">{formatUptime(inst.startedAt)}</p>
                    <p className="text-xs text-accent-green font-medium">{calcCost(inst.startedAt, inst.pricePerHour)}</p>
                    <div className="flex items-center gap-2">
                      <span className={`tag ${
                        inst.status === 'Running'
                          ? 'border-accent-green text-accent-green bg-accent-light'
                          : inst.status === 'Pending'
                          ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/5'
                          : 'border-border-subtle text-text-muted'
                      }`}>{inst.status}</span>
                      {inst.status === 'Running' && (
                        <button
                          onClick={() => handleTerminate(inst.id)}
                          className="text-text-muted hover:text-red-400 transition-colors cursor-pointer p-0.5 rounded"
                          title="Terminate instance"
                          aria-label={`Terminate ${inst.name}`}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {instances.map(inst => (
                  <div key={`m-${inst.id}`} className="md:hidden px-5 py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          inst.status === 'Running' ? 'bg-accent-green animate-pulse' : 'bg-border-default'
                        }`} />
                        <span className="text-sm font-medium text-text-primary">{inst.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-accent-green font-medium">{calcCost(inst.startedAt, inst.pricePerHour)}</span>
                        {inst.status === 'Running' && (
                          <button
                            onClick={() => handleTerminate(inst.id)}
                            className="text-text-muted hover:text-red-400 transition-colors cursor-pointer"
                            aria-label={`Terminate ${inst.name}`}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-text-muted font-mono">{inst.id}</p>
                    <div className="flex gap-4 text-xs text-text-muted">
                      <span>{inst.gpu}</span>
                      <span>· {formatUptime(inst.startedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      </div>
    </div>
  )
}
