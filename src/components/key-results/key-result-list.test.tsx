import { render, screen } from '@testing-library/react'
import { KeyResultList } from './key-result-list'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Id } from "../../../convex/_generated/dataModel"

// Mock dependencies
const mockGetKeyResultsWithHealth = vi.fn()
const mockDeleteKeyResult = vi.fn()

vi.mock('convex/react', () => ({
  useQuery: (query: unknown) => {
    if (query === 'getKeyResultsWithHealth') return mockGetKeyResultsWithHealth()
    if (query === 'getPhasing') return []
    if (query === 'getProgressEntries') return []
    if (query === 'getMilestones') return []
    return undefined
  },
  useMutation: () => mockDeleteKeyResult,
}))

vi.mock('../../../convex/_generated/api', () => ({
  api: {
    keyResults: {
      getKeyResultsWithHealth: 'getKeyResultsWithHealth',
      deleteKeyResult: 'deleteKeyResult',
      updateStageStatus: 'updateStageStatus',
      updateChecklistItems: 'updateChecklistItems',
      updateWorkstreamPhaseStatus: 'updateWorkstreamPhaseStatus',
      addCriticalIncident: 'addCriticalIncident',
      resolveIncident: 'resolveIncident',
      updateKeyResult: 'updateKeyResult',
      updateKeyResultProgress: 'updateKeyResultProgress',
    },
    phasing: {
      getPhasing: 'getPhasing',
    },
    progressEntries: {
      getProgressEntries: 'getProgressEntries',
    },
    milestones: {
      getMilestones: 'getMilestones',
      toggleMilestone: 'toggleMilestone',
    },
  },
}))

// Mock child components
vi.mock('./edit-key-result-dialog', () => ({
  EditKeyResultDialog: () => <button>Editar</button>,
}))
vi.mock('./update-progress-dialog', () => ({
  UpdateProgressDialog: () => <button>Atualizar Progresso</button>,
}))
vi.mock('./kr-detail-view', () => ({
  KrDetailView: () => <button>Ver Detalhes</button>,
}))
vi.mock('../phasing/phasing-editor', () => ({
  PhasingEditor: () => <button>Planejar Progresso</button>,
}))
vi.mock('./type-config/stage-gate-config-editor', () => ({
  StageGateConfigEditor: () => <button>Config Estágios</button>,
}))
vi.mock('./type-config/checklist-config-editor', () => ({
  ChecklistConfigEditor: () => <button>Config Checklist</button>,
}))
vi.mock('./type-config/multi-phase-config-editor', () => ({
  MultiPhaseConfigEditor: () => <button>Config Multifase</button>,
}))

describe('KeyResultList', () => {
  const mockObjectiveId = 'obj-1' as unknown as Id<"objectives">

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    mockGetKeyResultsWithHealth.mockReturnValue(undefined)
    render(<KeyResultList objectiveId={mockObjectiveId} />)
    expect(screen.getByText('Carregando KRs...')).toBeInTheDocument()
  })

  it('renders empty state when no KRs', () => {
    mockGetKeyResultsWithHealth.mockReturnValue([])
    render(<KeyResultList objectiveId={mockObjectiveId} />)
    expect(screen.getByText(/Nenhum Key Result adicionado/i)).toBeInTheDocument()
  })

  it('renders key results correctly', () => {
    const mockData = [
      {
        _id: 'kr-1',
        title: 'Get 100 users',
        currentValue: 50,
        targetValue: 100,
        initialValue: 0,
        unit: 'users',
        measurementType: 'NUMERIC',
        direction: 'INCREASING',
        hasProgress: false,
        health: 'NOT_STARTED',
      },
    ]
    mockGetKeyResultsWithHealth.mockReturnValue(mockData)
    render(<KeyResultList objectiveId={mockObjectiveId} />)
    expect(screen.getByText('Get 100 users')).toBeInTheDocument()
  })

  it('renders financial KR with correct type label', () => {
    const mockData = [
      {
        _id: 'kr-2',
        title: 'Revenue target',
        currentValue: 50000,
        targetValue: 100000,
        initialValue: 0,
        unit: 'BRL',
        measurementType: 'FINANCIAL',
        direction: 'INCREASING',
        currency: 'BRL',
        hasProgress: false,
        health: 'NOT_STARTED',
      },
    ]
    mockGetKeyResultsWithHealth.mockReturnValue(mockData)
    render(<KeyResultList objectiveId={mockObjectiveId} />)
    expect(screen.getByText('Revenue target')).toBeInTheDocument()
    // FINANCIAL maps to CUMULATIVE_NUMERIC via resolveKrType
    expect(screen.getByText(/Numérico Cumulativo/)).toBeInTheDocument()
  })
})
