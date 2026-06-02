export interface GPU {
  id: string
  tier: 'Entry' | 'Pro' | 'AI Workstation'
  hardware: string
  gpu: string
  gpuCount: number
  vram: number
  cpu: number
  ram: number
  storage: number
  bandwidth: number
  useCase: string
  pricePerHour: number
  available: number
  total: number
}

export const gpus: GPU[] = [
  {
    id: 'rtx-4090-2x',
    tier: 'Entry',
    hardware: 'RTX Consumer Server',
    gpu: 'RTX 4090',
    gpuCount: 2,
    vram: 48,
    cpu: 32,
    ram: 128,
    storage: 1000,
    bandwidth: 10,
    useCase: 'Development, 7B–13B inference',
    pricePerHour: 1.49,
    available: 8,
    total: 12,
  },
  {
    id: 'rtx-6000-2x',
    tier: 'Pro',
    hardware: 'RTX Pro Server',
    gpu: 'RTX PRO 6000 Blackwell',
    gpuCount: 2,
    vram: 96,
    cpu: 64,
    ram: 256,
    storage: 2000,
    bandwidth: 25,
    useCase: '13B training, production inference',
    pricePerHour: 3.29,
    available: 4,
    total: 6,
  },
  {
    id: 'blackwell-gb10',
    tier: 'AI Workstation',
    hardware: 'GB10 Superchip',
    gpu: 'GB10 Superchip',
    gpuCount: 1,
    vram: 128,
    cpu: 20,
    ram: 128,
    storage: 4000,
    bandwidth: 50,
    useCase: '70B inference, fine-tuning',
    pricePerHour: 6.99,
    available: 2,
    total: 3,
  },
]
