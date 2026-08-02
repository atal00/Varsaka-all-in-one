import { useReveal } from '../hooks/useReveal.js'

export default function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const ref = useReveal()
  return (
    <Tag ref={ref} data-reveal-delay={delay} className={className}>
      {children}
    </Tag>
  )
}
