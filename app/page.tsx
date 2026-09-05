import Portfolio from '@/components/Portfolio'

export default function Page() {
  return (
    // Site-wide ground. Plain opaque #0a0514 layer that the whole page sits on.
    // The cursor-trail canvas that used to live here has been removed.
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: '#0a0514' }}>
      <Portfolio />
    </div>
  )
}
