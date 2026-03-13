import { render, screen } from '@testing-library/react'
import { ObjectiveList } from './objective-list'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock dependencies
const mockGetObjectives = vi.fn()

vi.mock('convex/react', () => ({
  useQuery: (query: unknown) => {
    if (query === 'getObjectives') return mockGetObjectives()
    if (query === 'getCycle') return undefined
    if (query === 'getCycles') return []
    if (query === 'getFranchises') return []
    return undefined
  },
  useMutation: () => vi.fn(),
}))

vi.mock('../../../convex/_generated/api', () => ({
  api: {
    objectives: {
      getObjectives: 'getObjectives',
      createObjective: 'createObjective',
    },
    cycles: {
      getCycle: 'getCycle',
      getCycles: 'getCycles',
    },
    franchises: {
      getFranchises: 'getFranchises',
    },
  },
}))

// Mock child components
vi.mock('./create-objective-dialog', () => ({
  CreateObjectiveDialog: () => <button>Novo Objetivo</button>,
}))

describe('ObjectiveList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    mockGetObjectives.mockReturnValue(undefined)
    render(<ObjectiveList />)
    // Loading state shows skeleton divs with animate-pulse (accordion design)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders empty state when no objectives', () => {
    mockGetObjectives.mockReturnValue([])
    render(<ObjectiveList />)
    expect(screen.getByText(/Nenhum objetivo encontrado/i)).toBeInTheDocument()
  })

  it('renders objective cards as links', () => {
    const mockData = [
      {
        _id: '1',
        title: 'Increase Revenue',
        status: 'IN_PROGRESS',
        progress: 45,
      },
    ]
    mockGetObjectives.mockReturnValue(mockData)
    render(<ObjectiveList />)
    expect(screen.getByText('Increase Revenue')).toBeInTheDocument()
    expect(screen.getByText('45%')).toBeInTheDocument()
    // IN_PROGRESS status doesn't show badge (only non-IN_PROGRESS statuses show)
    // Accordion row has 2 links (title + ExternalLink icon), both pointing to detail page
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(1)
    expect(links[0]).toHaveAttribute('href', '/planejamento/objetivos/1')
  })

  it('renders status badge with correct label', () => {
    const mockData = [
      {
        _id: '2',
        title: 'Reduce Costs',
        status: 'AT_RISK',
        progress: 20,
      },
    ]
    mockGetObjectives.mockReturnValue(mockData)
    render(<ObjectiveList />)
    expect(screen.getByText('Em Risco')).toBeInTheDocument()
  })
})
