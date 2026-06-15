import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SkipNav } from './SkipNav'

describe('SkipNav', () => {
  it('renders a skip navigation link', () => {
    render(<SkipNav />)
    const link = screen.getByText('Skip to main content')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#main-content')
  })
})
