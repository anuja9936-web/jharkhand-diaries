import type { ComponentType } from 'react';
import { ArrowRight, AudioLines, Globe, HandCoins, Leaf, MapPinned, Sparkles, Bot, Camera } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Button, Badge, Card } from '../../components/ui';
import {
  NotFoundState,
  PlaceholderPage,
  UnauthorizedState,
} from '../../components/common/StateBlocks';
import { siteConfig } from '../../config/site';

const featurePreview = [
  {
    icon: Bot,
    title: 'AI Trip Planner',
    description: 'Structured foundations for smart, personalized trip planning.',
  },
  {
    icon: AudioLines,
    title: 'Cultural Audio Guide',
    description: 'Route-ready content architecture for future storytelling and narration.',
  },
  {
    icon: HandCoins,
    title: 'Local Artisans',
    description: 'A direct digital path between visitors and local makers, hosts, and guides.',
  },
  {
    icon: Leaf,
    title: 'Eco Passport',
    description: 'A clean scaffold for sustainable exploration and reward tracking.',
  },
  {
    icon: Camera,
    title: 'AR Craft Experience',
    description: 'Placeholder space for immersive, craft-inspired digital previews.',
  },
  {
    icon: Globe,
    title: 'Smart Tourism',
    description: 'A modern foundation for tourism intelligence and community-first growth.',
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl space-y-3">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay-700">{eyebrow}</p>
      <h2 className="font-display text-2xl font-bold text-ink-900 md:text-3xl">{title}</h2>
      <p className="text-sm leading-6 text-ink-600 md:text-base">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Card className="group h-full transition-transform duration-300 hover:-translate-y-1">
      <div className="mb-4 inline-flex rounded-2xl bg-sand p-3 text-ink-700 transition-colors group-hover:bg-clay-100">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-600">{description}</p>
    </Card>
  );
}

export function HomePage() {
  return (
    <div className="space-y-16">
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-clay-200 bg-white/80 px-4 py-2 text-sm font-medium text-ink-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-clay-700" />
              Culture-rooted, tech-ready tourism infrastructure
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight text-ink-900 md:text-6xl">
                {siteConfig.heroTitle}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-ink-600 md:text-lg">{siteConfig.heroSubtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/explore" className="inline-flex items-center gap-2">
                  Explore Jharkhand
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/tourist/itinerary" className="inline-flex items-center gap-2">
                  Plan My Trip
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Badge variant="accent" className="justify-center py-2 text-sm">
                Tourists
              </Badge>
              <Badge variant="accent" className="justify-center py-2 text-sm">
                Vendors
              </Badge>
              <Badge variant="accent" className="justify-center py-2 text-sm">
                Admins
              </Badge>
            </div>
          </div>

          <Card className="pattern-surface relative overflow-hidden">
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-clay-200/40 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-forest-200/40 blur-3xl" />
            <div className="relative space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-ink-900 text-white">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/60">Digital bridge</p>
                  <p className="mt-2 text-3xl font-bold">3</p>
                  <p className="mt-1 text-sm text-white/70">User groups connected</p>
                </Card>
                <Card className="bg-white/80">
                  <p className="text-xs uppercase tracking-[0.24em] text-clay-700">Eco-first</p>
                  <p className="mt-2 text-3xl font-bold text-ink-900">1</p>
                  <p className="mt-1 text-sm text-ink-600">Shared platform vision</p>
                </Card>
              </div>
              <Card className="bg-white/85">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Sohrai and Khovar-inspired geometry</p>
                    <p className="mt-2 text-sm leading-6 text-ink-600">
                      The visual language is intentionally abstract, modern, and rooted in local artistic rhythm.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-sand p-3 text-clay-700">
                    <MapPinned className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Feature preview"
          title="Built for tourism, culture, and local economic flow"
          description="These cards map the future product areas we will implement incrementally, without overbuilding the foundation today."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featurePreview.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay-700">Cultural identity</p>
            <h2 className="font-display text-3xl font-bold text-ink-900">Sohrai and Khovar-inspired, not copied</h2>
            <p className="text-sm leading-6 text-ink-600">
              The interface uses abstract surfaces, earthy tones, and organic geometry that echo the feeling of
              indigenous art while staying clean, premium, and accessible.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-sand">
              <p className="text-sm font-semibold text-ink-900">Organic motifs</p>
              <p className="mt-2 text-sm leading-6 text-ink-600">Flowing edges and layered surfaces create visual texture.</p>
            </Card>
            <Card className="bg-white">
              <p className="text-sm font-semibold text-ink-900">Modern clarity</p>
              <p className="mt-2 text-sm leading-6 text-ink-600">Navigation and hierarchy stay clear on small screens too.</p>
            </Card>
            <Card className="bg-white">
              <p className="text-sm font-semibold text-ink-900">Warm palette</p>
              <p className="mt-2 text-sm leading-6 text-ink-600">Clay, forest, and sand tones keep the system cohesive.</p>
            </Card>
            <Card className="bg-sand">
              <p className="text-sm font-semibold text-ink-900">Reusable system</p>
              <p className="mt-2 text-sm leading-6 text-ink-600">The same components can power future modules without rewrites.</p>
            </Card>
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-4">
            <SectionHeading
              eyebrow="Local economy"
              title="Tourist → local vendor → direct digital economy"
              description="The future product flow helps money move more directly to local communities through transparent digital touchpoints."
            />
            <div className="grid gap-3 text-sm text-ink-700">
              <div className="rounded-2xl bg-sand p-4">Tourists discover verified local experiences and makers.</div>
              <div className="rounded-2xl bg-white p-4">Vendors gain a clean presence for listings, services, and trust.</div>
              <div className="rounded-2xl bg-sand p-4">Communities benefit from stronger visibility and direct bookings.</div>
            </div>
          </Card>
          <Card className="space-y-4">
            <SectionHeading
              eyebrow="Government intelligence"
              title="Verified data for better tourism planning"
              description="Later modules will let administrators understand patterns in destinations, alerts, verified vendors, and sustainable activity."
            />
            <div className="grid gap-3 text-sm text-ink-700">
              <div className="rounded-2xl bg-white p-4">Tourism analytics can support planning and investment decisions.</div>
              <div className="rounded-2xl bg-sand p-4">Verified profiles reduce noise and improve trust in the ecosystem.</div>
              <div className="rounded-2xl bg-white p-4">Alerts and activity signals can later support responsive governance.</div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

const publicPlaceholderBullets = {
  explore: ['Previewed destinations and cultural highlights will appear here.', 'Interactive filters and smart recommendations come later.'],
  destinations: ['District pages and destination records will be added in phase 2.', 'This route already matches the future information architecture.'],
  vendors: ['Vendor discovery and artisan directories will later use Supabase records.', 'The shell is ready for homestays, guides, transport, and craft providers.'],
  about: ['Project summary, team story, and platform goals live here.', 'Affiliation claims are intentionally avoided until officially established.'],
};

export function ExplorePage() {
  return (
    <PlaceholderPage
      eyebrow="Public explore"
      title="Explore Jharkhand"
      description="A future discovery layer for destinations, culture, eco-activities, and community-led experiences."
      bullets={publicPlaceholderBullets.explore}
    />
  );
}

export function DestinationsPage() {
  return (
    <PlaceholderPage
      eyebrow="Public destinations"
      title="Destinations"
      description="A placeholder directory for districts, landmarks, cultural places, and eco-tourism points of interest."
      bullets={publicPlaceholderBullets.destinations}
    />
  );
}

export function VendorsPage() {
  return (
    <PlaceholderPage
      eyebrow="Public vendors"
      title="Local vendors and providers"
      description="A future public directory for artisans, homestays, transport providers, guides, and local experiences."
      bullets={publicPlaceholderBullets.vendors}
    />
  );
}

export function AboutPage() {
  return (
    <PlaceholderPage
      eyebrow="About"
      title="About the platform"
      description="This project is a hackathon foundation for a culturally rooted tourism platform built by Team Respawn."
      bullets={publicPlaceholderBullets.about}
    />
  );
}

export function SignInPage() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <Badge variant="accent">Welcome back</Badge>
          <h1 className="font-display text-3xl font-bold text-ink-900">Sign in to continue</h1>
          <p className="text-sm leading-6 text-ink-600">
            Authentication is powered by Clerk. Your application role will eventually be synchronized from Supabase.
          </p>
          <div className="rounded-3xl bg-sand p-5 text-sm leading-6 text-ink-700">
            <p className="font-semibold text-ink-900">Role note</p>
            <p className="mt-2">
              Sign-in only handles identity. Tourist, vendor, and admin access will be determined separately by the
              application profile.
            </p>
          </div>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-4">
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
        </div>
      </Card>
    </div>
  );
}

export function SignUpPage() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <Badge variant="accent">Join the platform</Badge>
          <h1 className="font-display text-3xl font-bold text-ink-900">Create your account</h1>
          <p className="text-sm leading-6 text-ink-600">
            Create a Clerk identity first, then we will attach a profile and role in the application layer.
          </p>
          <div className="rounded-3xl bg-white p-5 text-sm leading-6 text-ink-700">
            <p className="font-semibold text-ink-900">What happens next</p>
            <p className="mt-2">
              Later phases will connect your account to a tourist, vendor, or admin profile depending on the
              backend-managed role assignment.
            </p>
          </div>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-4">
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
        </div>
      </Card>
    </div>
  );
}

export function UnauthorizedPage() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-3xl place-items-center px-4 py-16 sm:px-6 lg:px-8">
      <UnauthorizedState />
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-3xl place-items-center px-4 py-16 sm:px-6 lg:px-8">
      <NotFoundState />
    </div>
  );
}
