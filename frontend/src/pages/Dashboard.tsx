import { useState, useEffect } from 'react'
import { Terminal, Cpu, HardDrive, Activity, X, CheckCircle, Server } from 'lucide-react'
import { gpus } from '../data/gpus'

type Instance = {
  id: string
  name: string
  gpu: string
  os: string
  status: 'Running' | 'Pending' | 'Terminated'
  uptime: string
  cost: string
}

const STORAGE_KEY = 'kubex_instances'

const defaultInstances: Instance[] = [
  { id: 'inst-a1b2c3', name: 'training-run-01', gpu: 'RTX 4090', os: 'Ubuntu 24.04 LTS', status: 'Running', uptime: '2h 14m', cost: '$3.32' },
  { id: 'inst-d4e5f6', name: 'inference-prod', gpu: 'RTX 6000 Ada', os: 'Rocky Linux 9.7', status: 'Running', uptime: '18h 05m', cost: '$59.32' },
]

function loadInstances(): Instance[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultInstances
    const parsed: Instance[] = JSON.parse(saved)
    return parsed.map(i => ({ os: 'Ubuntu 24.04 LTS', ...i }))
  } catch {
    return defaultInstances
  }
}

export default function Dashboard() {
  const [instances, setInstances] = useState<Instance[]>(loadInstances)
  const [deploying, setDeploying] = useState(false)
  const [deployed, setDeployed] = useState(false)
  const [selectedGPU, setSelectedGPU] = useState(gpus[0].id)
  const [instanceName, setInstanceName] = useState('')
  const [selectedOS, setSelectedOS] = useState('Ubuntu 24.04 LTS')

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
        name: instanceName, gpu: gpu.gpu, os: selectedOS,
        status: 'Running', uptime: '0m', cost: '$0.00',
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

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="section-label mb-2">Console</p>
          <h1 className="font-bold text-4xl text-text-primary">Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Server size={15} className="text-accent-green" />, label: 'Running', value: instances.filter(i => i.status === 'Running').length.toString() },
            { icon: <Cpu size={15} className="text-accent-green" />, label: 'vCPUs Used', value: '96 / 288' },
            { icon: <HardDrive size={15} className="text-accent-green" />, label: 'Storage', value: '3.2 / 10 TB' },
            { icon: <Activity size={15} className="text-accent-green" />, label: "Today's Cost", value: '$62.64' },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <div className="flex items-center gap-2 mb-3 text-text-muted">{s.icon}<span className="text-xs">{s.label}</span></div>
              <div className="font-bold text-2xl text-text-primary">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Deploy panel */}
          <div className="space-y-4">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Terminal size={15} className="text-accent-green" />
                <span className="font-semibold text-sm text-text-primary">Launch Instance</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-text-muted block mb-1.5">Instance Name</label>
                  <input
                    type="text" value={instanceName}
                    onChange={e => setInstanceName(e.target.value)}
                    placeholder="my-training-run"
                    className="w-full bg-bg-elevated border border-border-subtle text-text-primary text-sm px-3 py-2 rounded-md focus:outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green/20 transition-all placeholder:text-text-muted"
                  />
                </div>

                <div>
                  <label className="text-xs text-text-muted block mb-1.5">GPU Tier</label>
                  <div className="space-y-2">
                    {gpus.map(gpu => (
                      <button key={gpu.id} onClick={() => setSelectedGPU(gpu.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          selectedGPU === gpu.id
                            ? 'border-accent-green bg-accent-light'
                            : 'border-border-subtle hover:border-border-default bg-bg-elevated'
                        }`}>
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
                  <label className="text-xs text-text-muted block mb-1.5">OS Image</label>
                  <select value={selectedOS} onChange={e => setSelectedOS(e.target.value)} className="w-full bg-bg-elevated border border-border-subtle rounded-md px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-accent-green transition-all appearance-none">
                    <option>Ubuntu 24.04 LTS</option>
                    <option>Rocky Linux 9.7</option>
                  </select>
                </div>

                <button onClick={handleDeploy} disabled={deploying || !instanceName.trim()}
                  className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed">
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
            <div className="card p-5">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Cluster Nodes</p>
              <div className="space-y-4">
                {[
                  { label: 'rgx-node-01', ip: '10.10.30.10' },
                  { label: 'rgx-node-02', ip: '10.10.30.11' },
                  { label: 'rgx-node-03', ip: '10.10.30.12' },
                ].map(node => (
                  <div key={node.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{node.label}</p>
                      <p className="font-mono text-xs text-text-muted">{node.ip}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="status-dot" />
                      <span className="text-xs text-accent-green font-medium">Ready</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Instances table */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <Activity size={15} className="text-accent-green" />
                  <span className="font-semibold text-sm text-text-primary">Active Instances</span>
                </div>
                <span className="text-xs text-text-muted">{instances.filter(i => i.status === 'Running').length} running</span>
              </div>

              {/* Table header */}
              <div className="hidden md:grid grid-cols-[1fr_140px_130px_90px_70px_80px] items-center px-6 py-2 border-b border-border-subtle">
                {['Instance', 'GPU', 'OS', 'Uptime', 'Cost', 'Status'].map(h => (
                  <span key={h} className="text-xs text-text-muted font-medium">{h}</span>
                ))}
              </div>

              <div className="divide-y divide-border-subtle">
                {instances.length === 0 && (
                  <div className="px-6 py-14 text-center text-sm text-text-muted">No instances. Deploy one to get started.</div>
                )}
                {instances.map(inst => (
                  <div key={inst.id} className="grid grid-cols-[1fr_140px_130px_90px_70px_80px] items-center px-6 py-4 hover:bg-bg-surface transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        inst.status === 'Running' ? 'bg-accent-green animate-pulse' :
                        inst.status === 'Pending' ? 'bg-yellow-400 animate-pulse' : 'bg-border-default'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{inst.name}</p>
                        <p className="font-mono text-xs text-text-muted">{inst.id}</p>
                      </div>
                    </div>
                    <p className="text-xs text-text-primary">{inst.gpu}</p>
                    <p className="text-xs text-text-muted">{inst.os}</p>
                    <p className="text-xs text-text-primary">{inst.uptime}</p>
                    <p className="text-xs text-accent-green font-medium">{inst.cost}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                        inst.status === 'Running' ? 'border-accent-green text-accent-green bg-accent-light' :
                        inst.status === 'Pending' ? 'border-yellow-500 text-yellow-400' :
                        'border-border-subtle text-text-muted'
                      }`}>{inst.status}</span>
                      {inst.status === 'Running' && (
                        <button onClick={() => handleTerminate(inst.id)} className="text-text-muted hover:text-red-400 transition-colors" title="Terminate">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
