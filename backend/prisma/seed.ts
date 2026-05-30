import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.gpuTier.deleteMany()

  await prisma.gpuTier.createMany({
    data: [
      {
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
        tier: 'Pro',
        hardware: 'RTX Pro Server',
        gpu: 'RTX 6000 Ada',
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
        tier: 'AI Workstation',
        hardware: 'GB10 Superchip',
        gpu: 'NVIDIA Blackwell',
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
    ],
  })

  console.log('Seed complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
