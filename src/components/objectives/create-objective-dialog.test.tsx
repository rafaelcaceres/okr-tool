import { render, screen, fireEvent } from '@testing-library/react'
import { CreateObjectiveDialog } from './create-objective-dialog'
import { vi, describe, it, expect } from 'vitest'

// Mock Convex
vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => vi.fn()),
  useQuery: vi.fn(() => []),
}))

// Mock API
vi.mock('../../../convex/_generated/api', () => ({
  api: {
    objectives: {
      createObjective: 'createObjective',
    },
    cycles: {
      getCycles: 'getCycles',
    },
    franchises: {
      getFranchises: 'getFranchises',
    },
  },
}))

describe('CreateObjectiveDialog', () => {
  it('renders the create button', () => {
    render(<CreateObjectiveDialog />)
    expect(screen.getByRole('button', { name: /novo objetivo/i })).toBeInTheDocument()
  })

  it('opens dialog on click', () => {
    render(<CreateObjectiveDialog />)
    const button = screen.getByRole('button', { name: /novo objetivo/i })
    fireEvent.click(button)
    expect(screen.getByText('Defina um novo objetivo para o ciclo de planejamento.')).toBeInTheDocument()
  })
})
