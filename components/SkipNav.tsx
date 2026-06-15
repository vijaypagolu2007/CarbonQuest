'use client'

/**
 * Accessible skip-navigation link for keyboard and screen reader users.
 * Becomes visible on focus (WCAG 2.1 Level A, Success Criterion 2.4.1).
 */
export function SkipNav() {
  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        top: '-100px',
        left: '16px',
        zIndex: 9999,
        padding: '8px 16px',
        background: '#00FF87',
        color: '#050d0a',
        fontWeight: 700,
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '14px',
        transition: 'top 0.1s ease',
      }}
      onFocus={(e) => { e.currentTarget.style.top = '16px' }}
      onBlur={(e) => { e.currentTarget.style.top = '-100px' }}
    >
      Skip to main content
    </a>
  )
}
