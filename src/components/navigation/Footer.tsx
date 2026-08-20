import { Link } from 'react-router-dom';
import { Heart, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-ink-200/80 bg-ink-950 text-white selection:bg-clay-500/30">
      {/* Top Banner / Cultural Quote */}
      <div className="border-b border-white/10 bg-ink-900/60 py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-amber-400/40 bg-white/10 p-1">
              <img
                src="/images/jharkhand-logo.png"
                alt="Jharkhand Tourism Emblem"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-white tracking-tight">Johar Jharkhand</p>
              <p className="text-xs text-sand/80">Nature • Living Tribal Culture • Sustainable Discovery</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-sand/80">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Discover the soul of Chotanagpur and Santhal Pargana</span>
          </div>
        </div>
      </div>

      {/* Main Multi-column Sitemap */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Column 1: Brand & Philosophy */}
          <div className="col-span-2 space-y-4 lg:col-span-2">
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold text-white">Jharkhand Diaries</h3>
              <p className="max-w-sm text-xs leading-relaxed text-ink-300">
                The official next-generation travel platform connecting travelers directly with authentic
                destinations, indigenous art forms, forest sanctuaries, and community-led sustainable stays across all 24 districts.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-ink-400">
              <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] text-amber-300/90 border border-white/10">
                <MapPin className="h-3 w-3" /> 24 Districts
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] text-forest-300 border border-white/10">
                <ShieldCheck className="h-3 w-3" /> Eco-Protected Zones
              </span>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Explore</p>
            <ul className="space-y-2 text-xs text-ink-300">
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link to="/explore?category=waterfall" className="hover:text-white transition-colors">
                  Waterfalls
                </Link>
              </li>
              <li>
                <Link to="/explore?category=wildlife" className="hover:text-white transition-colors">
                  Wildlife & Forests
                </Link>
              </li>
              <li>
                <Link to="/explore?category=heritage" className="hover:text-white transition-colors">
                  Heritage Shrines
                </Link>
              </li>
              <li>
                <Link to="/explore?category=tribal_culture" className="hover:text-white transition-colors">
                  Tribal Traditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Travel & Stays */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Travel & Stays</p>
            <ul className="space-y-2 text-xs text-ink-300">
              <li>
                <Link to="/gallery" className="hover:text-white transition-colors">
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-white transition-colors">
                  Interactive Map
                </Link>
              </li>
              <li>
                <Link to="/experiences" className="hover:text-white transition-colors">
                  Experiences
                </Link>
              </li>
              <li>
                <Link to="/accommodations" className="hover:text-white transition-colors">
                  Accommodations
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-white transition-colors">
                  Artisan Marketplace
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Stories & Partners */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Stories & Partners</p>
            <ul className="space-y-2 text-xs text-ink-300">
              <li>
                <Link to="/blogs" className="hover:text-white transition-colors">
                  Travel Blogs
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Festivals & Events
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="hover:text-white transition-colors">
                  Share Feedback
                </Link>
              </li>
              <li className="pt-2">
                <Link to="/provider" className="text-sand font-medium hover:text-white transition-colors">
                  Service Provider Portal →
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-sand font-medium hover:text-white transition-colors">
                  Government Portal →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Jharkhand Diaries • Tourism & Cultural Gateway. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-white transition-colors">
              About Project
            </Link>
            <Link to="/feedback" className="hover:text-white transition-colors">
              Community Feedback
            </Link>
            <span className="inline-flex items-center gap-1 text-ink-400">
              Built with <Heart className="h-3 w-3 text-clay-400 fill-clay-400" /> for Jharkhand
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
