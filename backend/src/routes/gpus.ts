import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (_req, res) => {
  try {
    const gpus = await prisma.gpuTier.findMany({ orderBy: { pricePerHour: 'asc' } })
    res.json(gpus)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch GPU tiers' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const gpu = await prisma.gpuTier.findUnique({ where: { id: req.params.id } })
    if (!gpu) return res.status(404).json({ error: 'GPU tier not found' })
    res.json(gpu)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch GPU tier' })
  }
})

export default router
