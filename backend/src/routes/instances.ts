import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (_req, res) => {
  try {
    const instances = await prisma.instance.findMany({
      include: { gpuTier: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(instances)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch instances' })
  }
})

router.post('/', async (req, res) => {
  const { name, gpuTierId, os } = req.body

  if (!name || !gpuTierId) {
    return res.status(400).json({ error: 'name and gpuTierId are required' })
  }

  try {
    const gpuTier = await prisma.gpuTier.findUnique({ where: { id: gpuTierId } })
    if (!gpuTier) return res.status(404).json({ error: 'GPU tier not found' })

    const instance = await prisma.instance.create({
      data: { name, gpuTierId, os: os ?? 'Ubuntu 24.04 LTS' },
      include: { gpuTier: true },
    })
    res.status(201).json(instance)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create instance' })
  }
})

router.patch('/:id/terminate', async (req, res) => {
  try {
    const instance = await prisma.instance.update({
      where: { id: req.params.id },
      data: { status: 'Terminated' },
    })
    res.json(instance)
  } catch (err) {
    res.status(500).json({ error: 'Failed to terminate instance' })
  }
})

export default router
