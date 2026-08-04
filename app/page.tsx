import KineticGrid from '@/components/ui/kinetic-grid'
import Portfolio from '@/components/Portfolio'

export default function Page() {
  return (
    // monochrome keeps the grid white-on-black, matching the existing
    // terminal palette. The "default" theme is blue on #161618, which would
    // fight the green/cyan accents used throughout the portfolio.
    <KineticGrid globalColor="monochrome">
      <Portfolio />
    </KineticGrid>
  )
}
