import CrystalTrailBackground from '@/components/ui/crystal-trail-background'
import Portfolio from '@/components/Portfolio'

export default function Page() {
  return (
    // Site-wide ground. The canvas paints its own opaque #0a0514 and fades it
    // each frame, which is what leaves the cursor trail, so it has to be the
    // bottom layer for the whole page rather than a per-section effect.
    <CrystalTrailBackground>
      <Portfolio />
    </CrystalTrailBackground>
  )
}
