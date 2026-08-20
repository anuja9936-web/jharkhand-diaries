import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Store } from 'lucide-react';
import { Button } from '../ui';

export function HomeMarketplaceSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-950 via-ink-900 to-clay-950 p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-clay-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left Narrative */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/30">
              <Store className="h-3.5 w-3.5" />
              <span>DIRECT-FROM-COMMUNITY MARKETPLACE</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Discover Local. Take Home a Story.
            </h2>

            <p className="text-sm sm:text-base text-sand/90 leading-relaxed max-w-xl">
              Every purchase in our marketplace directly supports indigenous artisans, tribal women's cooperatives, and local homestay hosts across Jharkhand without intermediaries.
            </p>

            {/* Value Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2 text-xs text-sand/80">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>100% Authentic</strong> GI-tagged Sohrai, Khovar &amp; Dokra</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-sand/80">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Fair Livelihoods</strong> direct to registered rural artisans</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-sand/80">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Eco-friendly Packaging</strong> &amp; organic forest items</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-sand/80">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Verified Hosts</strong> for authentic homestays &amp; tours</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap gap-4">
              <Button variant="primary" asChild className="bg-amber-400 text-ink-950 hover:bg-amber-300">
                <Link to="/marketplace" className="inline-flex items-center gap-2 font-bold">
                  <span>EXPLORE MARKETPLACE</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button variant="ghost" asChild className="text-white border border-white/20 hover:bg-white/10">
                <Link to="/provider">Become a Registered Provider</Link>
              </Button>
            </div>
          </div>

          {/* Right Visual Collage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <img
                  src="/images/destinations/patratu-valley.jpg"
                  alt="Crafts"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-2.5 left-3 text-xs font-bold text-white">
                  GI-Tagged Murals
                </span>
              </div>
              <div className="relative h-32 sm:h-36 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <img
                  src="/images/destinations/betla-national-park.jpg"
                  alt="Organic Produce"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-2.5 left-3 text-xs font-bold text-white">
                  Wild Forest Honey
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="relative h-32 sm:h-36 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <img
                  src="/images/destinations/deoghar-baidyanath.jpg"
                  alt="Dokra Metal"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-2.5 left-3 text-xs font-bold text-white">
                  Dokra Bell Metal
                </span>
              </div>
              <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <img
                  src="/images/destinations/netarhat.jpg"
                  alt="Homestay"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-2.5 left-3 text-xs font-bold text-white">
                  Village Homestays
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
