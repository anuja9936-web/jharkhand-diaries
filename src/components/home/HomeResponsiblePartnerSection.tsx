import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Shield, ShieldCheck, Store, TreePine, Users } from 'lucide-react';

const RESPONSIBLE_PILLARS = [
  {
    title: 'Support Village Economies',
    description: 'Directly commission local tribal guides, artisans, and stay in verified indigenous homestays.',
    icon: Users,
  },
  {
    title: 'Leave No Trace in Eco-Zones',
    description: 'Keep plastic out of delicate waterfall basins, ancient sal groves, and elephant migration corridors.',
    icon: Leaf,
  },
  {
    title: 'Respect Living Traditions',
    description: 'Seek permission before photographing village rituals, sacred Sarna groves, and residential mud murals.',
    icon: ShieldCheck,
  },
  {
    title: 'Preserve Wild Habitats',
    description: 'Travel with certified eco-guides in tiger reserves and sanctuaries maintaining silence and safe distance.',
    icon: TreePine,
  },
];

export function HomeResponsiblePartnerSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
      {/* 1. Responsible Tourism Section */}
      <div className="rounded-3xl border border-forest-500/30 bg-gradient-to-br from-forest-900 via-forest-950 to-ink-950 p-8 sm:p-12 lg:p-16 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-forest-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-500/20 px-3.5 py-1 text-xs font-bold text-forest-300 border border-forest-500/30">
            <Leaf className="h-3.5 w-3.5" />
            <span>RESPONSIBLE &amp; SUSTAINABLE TOURISM</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Travel. Discover. Preserve.
          </h2>

          <p className="text-sm sm:text-base text-forest-100/90 leading-relaxed">
            Jharkhand's pristine wilderness and living tribal cultures have thrived for millennia through harmonious coexistence. We invite every traveler to become a conscious custodian of this land.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
            {RESPONSIBLE_PILLARS.map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <item.icon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-sand/80 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Partner Portal Access Section */}
      <div className="text-center space-y-8 max-w-3xl mx-auto pt-6">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-clay-700">
            TOURISM ECOSYSTEM STAKEHOLDERS
          </p>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
            Part of Jharkhand's Tourism Story?
          </h3>
          <p className="text-xs sm:text-sm text-ink-600">
            Are you a local homestay owner, certified adventure guide, master artisan, or government tourism official?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl mx-auto">
          {/* Provider Card */}
          <div className="p-6 rounded-2xl border border-ink-200/80 bg-white shadow-xs hover:border-clay-400 transition-all flex flex-col justify-between text-left space-y-4">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-xl bg-clay-100 p-2.5 text-clay-700">
                <Store className="h-full w-full" />
              </div>
              <h4 className="font-display text-lg font-bold text-ink-900">Service Provider</h4>
              <p className="text-xs text-ink-600 leading-relaxed">
                List your homestays, handcrafted products, and guided tours directly to travelers worldwide.
              </p>
            </div>
            <Link
              to="/provider"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-clay-700 hover:text-clay-800 transition-colors"
            >
              <span>Access Provider Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Admin / Government Card */}
          <div className="p-6 rounded-2xl border border-ink-200/80 bg-white shadow-xs hover:border-forest-400 transition-all flex flex-col justify-between text-left space-y-4">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-xl bg-forest-100 p-2.5 text-forest-700">
                <Shield className="h-full w-full" />
              </div>
              <h4 className="font-display text-lg font-bold text-ink-900">Government Portal</h4>
              <p className="text-xs text-ink-600 leading-relaxed">
                Platform oversight, destination curation, eco-zone management, and tourism analytics.
              </p>
            </div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 hover:text-forest-800 transition-colors"
            >
              <span>Access Government Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
