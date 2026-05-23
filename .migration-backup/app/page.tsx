import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
  locked?: boolean;
};

type FeatureItem = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

type FooterColumn = {
  title: string;
  items: string[];
};

const navItems: NavItem[] = [
  { label: "HOME", href: "/" },
  { label: "STUDIOS", href: "/studios" },
  { label: "PROFILE", href: "/login?next=%2Fprofile", locked: true },
  { label: "MESSAGES", href: "/login?next=%2Fmessages", locked: true },
];

const topFeatures: FeatureItem[] = [
  {
    title: "FOR CREATORS",
    description:
      "Create a free profile, share your content, and grow your audience.",
    icon: <CameraIcon />,
  },
  {
    title: "FOR FANS",
    description:
      "Subscribe to your favorite creators and unlock exclusive content.",
    icon: <HeartOutlineIcon />,
  },
  {
    title: "EXCLUSIVE STUDIOS",
    description:
      "Premium studio content, polished releases, and gated experiences.",
    icon: <PlayLockIcon />,
  },
  {
    title: "SAFE & PRIVATE",
    description:
      "Secure, private, and built with creators and fans in mind.",
    icon: <ShieldIcon />,
  },
];

const howItWorks: FeatureItem[] = [
  {
    title: "CREATE YOUR PROFILE",
    description:
      "Sign up and build your free profile. Add photos, links, and promote who you are.",
    icon: <UserPlusIcon />,
  },
  {
    title: "GROW YOUR AUDIENCE",
    description:
      "Share your profile and attract fans who love your content and want more.",
    icon: <GrowthIcon />,
  },
  {
    title: "EARN & CONNECT",
    description:
      "Offer subscriptions, gated pages, and premium content directly to your audience.",
    icon: <DollarIcon />,
  },
  {
    title: "SAFE & COMPLIANT",
    description:
      "18+ only with clear rules, locked access, and a platform-first creator experience.",
    icon: <ShieldCheckIcon />,
  },
];

const footerColumns: FooterColumn[] = [
  {
    title: "INFORMATION",
    items: ["About Us", "Terms of Service", "Privacy Policy", "DMCA"],
  },
  {
    title: "SUPPORT",
    items: ["Contact Us", "FAQ", "Safety"],
  },
  {
    title: "CREATORS",
    items: ["Creator Guidelines", "How It Works", "Payouts"],
  },
  {
    title: "FOLLOW US",
    items: ["X", "Instagram", "Reddit", "Email"],
  },
];

export default function HomePage() {
  return (
    <main style={styles.page}>
      <BackgroundGlow />
      <div style={styles.shell}>
        <TopNav />

        <HeroSection />

        <section style={styles.featureGrid}>
          {topFeatures.map((item, index) => (
            <FeatureCard
              key={item.title}
              title={item.title}
              description={item.description}
              icon={item.icon}
              bordered={index !== topFeatures.length - 1}
            />
          ))}
        </section>

        <section style={styles.mainContentGrid}>
          <BigActionCard
            title="HOME"
            description="Discover new creators, featured studios, and exclusive content."
            buttonLabel="ENTER SITE"
            href="/"
            imageUrl="https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1600&auto=format&fit=crop"
            highlighted
            icon={<HomeIcon />}
          />

          <BigActionCard
            title="STUDIOS"
            description="Browse studio pages and explore their exclusive content collections."
            buttonLabel="BROWSE STUDIOS"
            href="/studios"
            imageUrl="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1600&auto=format&fit=crop"
            icon={<StudioIcon />}
          />

          <LockedProfileCard />

          <div style={styles.sideStack}>
            <MiniProfilePreview />
            <SubscribeUnlockCard />
          </div>
        </section>

        <div style={styles.lockNotice}>
          <LockIcon />
          <span>PROFILE, MESSAGES, AND FULL ACCESS ARE LOCKED UNTIL YOU LOG IN</span>
        </div>

        <section style={styles.lowerContentGrid}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              HOW <span style={styles.pinkText}>BIMBOY</span> WORKS
            </div>

            <div style={styles.howGrid}>
              {howItWorks.map((item) => (
                <div key={item.title} style={styles.howItem}>
                  <div style={styles.howIcon}>{item.icon}</div>
                  <div>
                    <div style={styles.howTitle}>{item.title}</div>
                    <div style={styles.howDescription}>{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ProfileTeaserCard />

          <div style={styles.rightColumn}>
            <div style={styles.panel}>
              <div style={styles.whyTitle}>
                WHY FANS LOVE <span style={styles.pinkText}>BIMBOY</span>
              </div>

              <div style={styles.whyList}>
                <WhyLine
                  icon={<HeartOutlineIcon />}
                  title="SUPPORT YOUR FAVORITES"
                  text="Directly support creators and studios you love."
                />
                <WhyLine
                  icon={<PlayLockIcon />}
                  title="EXCLUSIVE ACCESS"
                  text="Unlock premium content not available anywhere else."
                />
                <WhyLine
                  icon={<MessageIcon />}
                  title="PRIVATE MESSAGING"
                  text="Connect privately with creators you subscribe to."
                />
                <WhyLine
                  icon={<ShieldIcon />}
                  title="SAFE & SECURE"
                  text="Your privacy and security are a core part of the experience."
                />
              </div>
            </div>

            <SubscribeUnlockCard tall />
          </div>
        </section>

        <section style={styles.disclaimerRow}>
          <div style={styles.ageBadgeCard}>
            <div style={styles.ageBadgeCircle}>18+</div>
            <div style={styles.ageOnlyText}>ONLY</div>
          </div>

          <div style={styles.disclaimerCard}>
            <div style={styles.disclaimerTitle}>DISCLAIMER</div>
            <p style={styles.disclaimerText}>
              BimBoy is an adult platform intended only for individuals 18 years of age
              or older. By entering and using this site, you confirm that you are at
              least 18+ and legally permitted to access adult content in your
              jurisdiction. All creators, models, performers, and studios on the
              platform are expected to comply with applicable laws and platform rules.
              Some pages, studio sections, profile content, and messaging tools are
              gated behind login, subscription, or account access requirements.
              Unauthorized copying, redistribution, or misuse of content is prohibited.
            </p>
          </div>
        </section>

        <section style={styles.ctaBanner}>
          <div style={styles.ctaBannerOverlay} />
          <div style={styles.ctaBannerContent}>
            <div>
              <div style={styles.ctaTitle}>
                CREATORS & STUDIOS. THIS IS <span style={styles.pinkText}>YOUR HOME.</span>
              </div>
              <div style={styles.ctaText}>
                Join BimBoy and build a polished profile, gated creator page, or
                full studio presence that feels premium from day one.
              </div>
            </div>

            <Link href="/login" style={styles.primaryLargeButton}>
              JOIN NOW FOR FREE
            </Link>
          </div>
        </section>

        <footer style={styles.footer}>
          <div style={styles.footerBrandColumn}>
            <div style={styles.footerLogo}>
              BIM<span style={styles.pinkText}>BOY</span>
            </div>
            <div style={styles.footerCopy}>© 2026 BimBoy. All Rights Reserved.</div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title} style={styles.footerColumn}>
              <div style={styles.footerColumnTitle}>{column.title}</div>
              <div style={styles.footerLinkList}>
                {column.items.map((item) => (
                  <span key={item} style={styles.footerLinkItem}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </footer>
      </div>
    </main>
  );
}

function TopNav() {
  return (
    <header style={styles.navWrap}>
      <Link href="/" style={styles.logo}>
        BIM<span style={styles.logoPink}>BOY</span>
      </Link>

      <nav style={styles.navDesktop}>
        {navItems.map((item) => (
          <Link key={item.label} href={item.href} style={styles.navItem}>
            <span>{item.label}</span>
            {item.locked ? <LockTinyIcon /> : null}
          </Link>
        ))}
      </nav>

      <div style={styles.navActions}>
        <Link href="/login" style={styles.secondaryButton}>
          LOG IN
        </Link>
        <Link href="/login" style={styles.primaryButton}>
          SIGN UP
        </Link>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section style={styles.heroWrap}>
      <div style={styles.heroGrid}>
        <div style={styles.heroImageLeft}>
          <div style={styles.heroImageOverlay} />
        </div>

        <div style={styles.heroCenter}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>
              EXCLUSIVE <span style={styles.pinkText}>CONTENT.</span>
              <br />
              REAL PEOPLE.
              <br />
              REAL CONNECTIONS.
            </h1>

            <p style={styles.heroDescription}>
              BimBoy is the ultimate platform for adult creators and studios to share
              exclusive content, build their brand, and connect with fans who
              appreciate real premium content.
            </p>

            <Link href="/login" style={styles.heroButton}>
              JOIN BIMBOY
            </Link>

            <div style={styles.heroMeta}>
              <span>18+ Only</span>
              <span style={styles.dot}>•</span>
              <span>Safe & Private</span>
              <span style={styles.dot}>•</span>
              <span>Creator Focused</span>
            </div>
          </div>
        </div>

        <div style={styles.heroImageRight}>
          <div style={styles.heroImageOverlayRight} />
          <div style={styles.neonSign}>
            <div>BIMBOY</div>
            <div>STUDIOS</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  bordered,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  bordered?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.featureCard,
        borderRight: bordered ? "1px solid rgba(255,255,255,0.08)" : "none",
      }}
    >
      <div style={styles.featureIcon}>{icon}</div>
      <div>
        <div style={styles.featureTitle}>{title}</div>
        <div style={styles.featureDescription}>{description}</div>
      </div>
    </div>
  );
}

function BigActionCard({
  title,
  description,
  buttonLabel,
  href,
  imageUrl,
  highlighted,
  icon,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
  imageUrl: string;
  highlighted?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        ...styles.actionCard,
        border: highlighted
          ? "1px solid rgba(255, 42, 124, 0.55)"
          : "1px solid rgba(255, 42, 124, 0.18)",
        boxShadow: highlighted
          ? "0 0 40px rgba(255, 42, 124, 0.12)"
          : "none",
      }}
    >
      <div
        style={{
          ...styles.actionCardImage,
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.70)), url('${imageUrl}')`,
        }}
      />
      <div style={styles.actionCardBody}>
        <div style={styles.actionCardTitleRow}>
          <div style={styles.actionCardIcon}>{icon}</div>
          <div style={styles.actionCardTitle}>{title}</div>
        </div>
        <div style={styles.actionCardDescription}>{description}</div>
        <Link href={href} style={styles.primarySmallButton}>
          {buttonLabel}
        </Link>
      </div>
    </div>
  );
}

function LockedProfileCard() {
  return (
    <div style={styles.lockedCard}>
      <div style={styles.lockedBackdrop} />
      <div style={styles.lockedOverlay} />
      <div style={styles.lockedContent}>
        <div style={styles.lockedIconWrap}>
          <LockCircleIcon />
        </div>
        <div style={styles.lockedTitle}>PROFILE</div>
        <div style={styles.lockedText}>
          Create your profile, share your content, and build your following.
        </div>
        <Link href="/login?next=%2Fprofile" style={styles.lockedButton}>
          LOG IN TO CONTINUE
        </Link>
      </div>
    </div>
  );
}

function MiniProfilePreview() {
  return (
    <div style={styles.panel}>
      <div style={styles.miniProfileHeader}>
        <div style={styles.miniAvatar} />
        <div>
          <div style={styles.miniProfileName}>BimBoy Model</div>
          <div style={styles.miniProfileHandle}>@bimboymodel</div>
          <div style={styles.miniProfileRole}>Adult Model | Content Creator</div>
        </div>
      </div>

      <div style={styles.miniProfileBio}>Exclusive content, just for my fans.</div>

      <div style={styles.miniStats}>
        <StatBlock value="128" label="POSTS" />
        <StatBlock value="3.2K" label="FOLLOWERS" />
        <StatBlock value="54" label="FOLLOWING" />
      </div>

      <Link href="/login?next=%2Fprofile" style={styles.primaryWideButton}>
        SUBSCRIBE TO VIEW CONTENT
      </Link>
    </div>
  );
}

function ProfileTeaserCard() {
  return (
    <div style={styles.panel}>
      <div style={styles.profileTeaserBanner} />
      <div style={styles.profileTeaserBody}>
        <div style={styles.profileTeaserTop}>
          <div style={styles.profileAvatarLarge} />
          <div>
            <div style={styles.profileTeaserName}>BimBoy Model</div>
            <div style={styles.profileTeaserHandle}>@bimboymodel</div>
          </div>
        </div>

        <div style={styles.profileTeaserDescription}>
          Adult model, premium creator, and studio-ready performer. Teasers, full
          sets, private drops, and subscription-only content.
        </div>

        <div style={styles.profileTeaserStats}>
          <StatBlock value="128" label="POSTS" />
          <StatBlock value="3.2K" label="FOLLOWERS" />
          <StatBlock value="54" label="FOLLOWING" />
        </div>

        <Link href="/login?next=%2Fprofile" style={styles.primaryWideButton}>
          SUBSCRIBE TO VIEW CONTENT
        </Link>
      </div>
    </div>
  );
}

function SubscribeUnlockCard({ tall = false }: { tall?: boolean }) {
  return (
    <div
      style={{
        ...styles.panel,
        ...(tall ? { minHeight: 320, justifyContent: "center" } : {}),
      }}
    >
      <div style={styles.subscribeIcon}>
        <HeartLockIcon />
      </div>
      <div style={styles.subscribeTitle}>SUBSCRIBE TO UNLOCK</div>
      <div style={styles.subscribeText}>
        This profile is private. Subscribe to view all content and support this
        creator.
      </div>
      <Link href="/login?next=%2Fprofile" style={styles.primaryWideButton}>
        SUBSCRIBE NOW
      </Link>
    </div>
  );
}

function WhyLine({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div style={styles.whyLine}>
      <div style={styles.whyIcon}>{icon}</div>
      <div>
        <div style={styles.whyLineTitle}>{title}</div>
        <div style={styles.whyLineText}>{text}</div>
      </div>
    </div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div style={styles.statBlock}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function BackgroundGlow() {
  return (
    <>
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />
      <div style={styles.glowThree} />
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(255,42,124,0.10), transparent 22%), radial-gradient(circle at top right, rgba(184,64,255,0.10), transparent 20%), linear-gradient(180deg, #060606 0%, #000000 100%)",
    color: "#ffffff",
    position: "relative",
    overflowX: "hidden",
  },

  shell: {
    position: "relative",
    zIndex: 2,
    maxWidth: 1760,
    margin: "0 auto",
    padding: "20px 20px 40px",
  },

  navWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    padding: "18px 24px",
    borderRadius: 28,
    border: "1px solid rgba(255, 42, 124, 0.18)",
    background: "rgba(10, 10, 10, 0.92)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 0 40px rgba(255, 42, 124, 0.08)",
    marginBottom: 14,
    flexWrap: "wrap",
  },

  logo: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: 900,
    textDecoration: "none",
    letterSpacing: "-0.04em",
  },

  logoPink: {
    color: "#ff2a7c",
  },

  navDesktop: {
    display: "flex",
    alignItems: "center",
    gap: 28,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  navItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "#ffffff",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: "0.18em",
  },

  navActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 96,
    padding: "12px 18px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: "0.06em",
    background: "rgba(255,255,255,0.02)",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 106,
    padding: "12px 18px",
    borderRadius: 12,
    color: "#ffffff",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: "0.06em",
    background: "linear-gradient(90deg, #ff2a7c 0%, #ff4f98 100%)",
    boxShadow: "0 16px 34px rgba(255, 42, 124, 0.32)",
  },

  heroWrap: {
    borderRadius: 34,
    overflow: "hidden",
    border: "1px solid rgba(255, 42, 124, 0.20)",
    background: "rgba(6,6,6,0.96)",
    boxShadow: "0 0 60px rgba(255, 42, 124, 0.08)",
  },

  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.05fr 1fr",
    minHeight: 670,
  },

  heroImageLeft: {
    position: "relative",
    minHeight: 340,
    backgroundImage:
      "linear-gradient(135deg, rgba(0,0,0,0.18), rgba(0,0,0,0.68)), url('https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1600&auto=format&fit=crop')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRight: "1px solid rgba(255,255,255,0.06)",
  },

  heroImageRight: {
    position: "relative",
    minHeight: 340,
    backgroundImage:
      "linear-gradient(225deg, rgba(0,0,0,0.10), rgba(0,0,0,0.72)), url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1600&auto=format&fit=crop')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderLeft: "1px solid rgba(255,255,255,0.06)",
  },

  heroImageOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(255,42,124,0.10), transparent 45%), linear-gradient(180deg, transparent, rgba(0,0,0,0.22))",
  },

  heroImageOverlayRight: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(270deg, rgba(184,64,255,0.14), transparent 45%), linear-gradient(180deg, transparent, rgba(0,0,0,0.26))",
  },

  heroCenter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "42px 28px",
    background:
      "radial-gradient(circle at top, rgba(255,42,124,0.10), transparent 30%), linear-gradient(180deg, #090909 0%, #050505 100%)",
  },

  heroContent: {
    width: "100%",
    maxWidth: 620,
    textAlign: "center",
  },

  heroTitle: {
    margin: 0,
    fontSize: "clamp(48px, 5vw, 84px)",
    lineHeight: 0.95,
    fontWeight: 900,
    letterSpacing: "-0.05em",
  },

  pinkText: {
    color: "#ff2a7c",
  },

  heroDescription: {
    marginTop: 24,
    marginBottom: 0,
    color: "rgba(255,255,255,0.78)",
    fontSize: 19,
    lineHeight: 1.7,
  },

  heroButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    padding: "18px 34px",
    borderRadius: 16,
    color: "#ffffff",
    textDecoration: "none",
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: "0.04em",
    background: "linear-gradient(90deg, #ff2a7c 0%, #ff4f98 100%)",
    boxShadow: "0 18px 44px rgba(255, 42, 124, 0.34)",
  },

  heroMeta: {
    marginTop: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
    color: "rgba(255,255,255,0.70)",
    fontSize: 14,
    fontWeight: 600,
  },

  dot: {
    color: "rgba(255,255,255,0.35)",
  },

  neonSign: {
    position: "absolute",
    top: 34,
    right: 34,
    padding: "18px 22px",
    borderRadius: 22,
    background: "rgba(10,10,10,0.30)",
    border: "1px solid rgba(255,42,124,0.20)",
    backdropFilter: "blur(8px)",
    color: "#ff7cb6",
    fontSize: 34,
    lineHeight: 0.98,
    fontWeight: 900,
    textAlign: "right",
    textShadow:
      "0 0 12px rgba(255,42,124,0.65), 0 0 24px rgba(255,42,124,0.40)",
  },

  featureGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    borderRadius: 28,
    overflow: "hidden",
    border: "1px solid rgba(255, 42, 124, 0.14)",
    background: "rgba(10, 10, 10, 0.94)",
  },

  featureCard: {
    display: "flex",
    gap: 18,
    padding: "26px 24px",
    alignItems: "flex-start",
  },

  featureIcon: {
    color: "#ff2a7c",
    width: 34,
    minWidth: 34,
    height: 34,
  },

  featureTitle: {
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: "0.14em",
    color: "#ffffff",
  },

  featureDescription: {
    marginTop: 8,
    color: "rgba(255,255,255,0.66)",
    fontSize: 15,
    lineHeight: 1.6,
  },

  mainContentGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "1.15fr 1.05fr 1.05fr 0.82fr",
    gap: 14,
    alignItems: "stretch",
  },

  sideStack: {
    display: "grid",
    gap: 14,
  },

  actionCard: {
    overflow: "hidden",
    borderRadius: 28,
    background: "rgba(10,10,10,0.96)",
  },

  actionCardImage: {
    height: 250,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  actionCardBody: {
    padding: "22px 22px 24px",
  },

  actionCardTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  actionCardIcon: {
    color: "#ff2a7c",
    width: 28,
    height: 28,
  },

  actionCardTitle: {
    fontSize: 48,
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: "-0.04em",
  },

  actionCardDescription: {
    marginTop: 12,
    color: "rgba(255,255,255,0.66)",
    fontSize: 15,
    lineHeight: 1.7,
    maxWidth: 420,
  },

  primarySmallButton: {
    display: "inline-flex",
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: "13px 22px",
    borderRadius: 12,
    textDecoration: "none",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: "0.06em",
    background: "linear-gradient(90deg, #ff2a7c 0%, #ff4f98 100%)",
    boxShadow: "0 14px 36px rgba(255, 42, 124, 0.26)",
  },

  lockedCard: {
    position: "relative",
    minHeight: 420,
    borderRadius: 28,
    overflow: "hidden",
    border: "1px solid rgba(255, 42, 124, 0.16)",
    background: "#070707",
  },

  lockedBackdrop: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(180deg, rgba(0,0,0,0.16), rgba(0,0,0,0.80)), url('https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1600&auto=format&fit=crop')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(2px)",
    transform: "scale(1.03)",
  },

  lockedOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.34)",
  },

  lockedContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    minHeight: 420,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: 26,
  },

  lockedIconWrap: {
    width: 88,
    height: 88,
    color: "rgba(255,255,255,0.82)",
  },

  lockedTitle: {
    marginTop: 18,
    fontSize: 56,
    fontWeight: 900,
    color: "rgba(255,255,255,0.84)",
    letterSpacing: "-0.05em",
  },

  lockedText: {
    marginTop: 12,
    maxWidth: 340,
    color: "rgba(255,255,255,0.62)",
    fontSize: 15,
    lineHeight: 1.7,
  },

  lockedButton: {
    display: "inline-flex",
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
    padding: "13px 22px",
    borderRadius: 12,
    textDecoration: "none",
    color: "#ff77ae",
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: "0.06em",
    border: "1px solid rgba(255, 42, 124, 0.42)",
    background: "rgba(255,255,255,0.02)",
  },

  panel: {
    borderRadius: 28,
    border: "1px solid rgba(255, 42, 124, 0.16)",
    background: "rgba(10, 10, 10, 0.96)",
    padding: 22,
    display: "flex",
    flexDirection: "column",
  },

  miniProfileHeader: {
    display: "flex",
    gap: 14,
    alignItems: "center",
  },

  miniAvatar: {
    width: 82,
    height: 82,
    borderRadius: "50%",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: "2px solid rgba(255,255,255,0.10)",
  },

  miniProfileName: {
    fontSize: 30,
    fontWeight: 900,
    lineHeight: 1,
  },

  miniProfileHandle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.56)",
    fontSize: 14,
    fontWeight: 700,
  },

  miniProfileRole: {
    marginTop: 8,
    color: "rgba(255,255,255,0.76)",
    fontSize: 14,
  },

  miniProfileBio: {
    marginTop: 16,
    color: "rgba(255,255,255,0.72)",
    fontSize: 15,
    lineHeight: 1.7,
  },

  miniStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
    marginTop: 18,
  },

  statBlock: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: "14px 10px",
    textAlign: "center",
  },

  statValue: {
    fontSize: 24,
    fontWeight: 900,
    lineHeight: 1,
  },

  statLabel: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.14em",
    color: "rgba(255,255,255,0.46)",
  },

  primaryWideButton: {
    display: "inline-flex",
    marginTop: 18,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: "15px 22px",
    borderRadius: 14,
    textDecoration: "none",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: "0.05em",
    background: "linear-gradient(90deg, #ff2a7c 0%, #ff4f98 100%)",
    boxShadow: "0 16px 40px rgba(255, 42, 124, 0.28)",
  },

  subscribeIcon: {
    width: 58,
    height: 58,
    color: "#ff2a7c",
  },

  subscribeTitle: {
    marginTop: 18,
    fontSize: 34,
    fontWeight: 900,
    lineHeight: 1.05,
    color: "#ff2a7c",
    letterSpacing: "-0.04em",
  },

  subscribeText: {
    marginTop: 14,
    color: "rgba(255,255,255,0.68)",
    fontSize: 16,
    lineHeight: 1.8,
    maxWidth: 360,
  },

  lockNotice: {
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    color: "rgba(255,255,255,0.42)",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textAlign: "center",
  },

  lowerContentGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr 0.95fr",
    gap: 14,
    alignItems: "stretch",
  },

  panelHeader: {
    fontSize: 46,
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: "-0.05em",
  },

  howGrid: {
    marginTop: 24,
    display: "grid",
    gap: 18,
  },

  howItem: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },

  howIcon: {
    width: 28,
    height: 28,
    color: "#ff2a7c",
    minWidth: 28,
    marginTop: 3,
  },

  howTitle: {
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: "0.14em",
    color: "#ff2a7c",
  },

  howDescription: {
    marginTop: 8,
    color: "rgba(255,255,255,0.68)",
    fontSize: 15,
    lineHeight: 1.7,
  },

  profileTeaserBanner: {
    height: 220,
    borderRadius: 22,
    backgroundImage:
      "linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.70)), url('https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1600&auto=format&fit=crop')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  profileTeaserBody: {
    paddingTop: 18,
  },

  profileTeaserTop: {
    display: "flex",
    gap: 16,
    alignItems: "center",
  },

  profileAvatarLarge: {
    width: 92,
    height: 92,
    borderRadius: "50%",
    border: "4px solid #0a0a0a",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    marginTop: -54,
    boxShadow: "0 10px 30px rgba(0,0,0,0.40)",
  },

  profileTeaserName: {
    fontSize: 28,
    fontWeight: 900,
    lineHeight: 1,
  },

  profileTeaserHandle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.56)",
    fontSize: 14,
    fontWeight: 700,
  },

  profileTeaserDescription: {
    marginTop: 16,
    color: "rgba(255,255,255,0.70)",
    fontSize: 15,
    lineHeight: 1.8,
  },

  profileTeaserStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
    marginTop: 18,
  },

  rightColumn: {
    display: "grid",
    gap: 14,
  },

  whyTitle: {
    fontSize: 30,
    fontWeight: 900,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
  },

  whyList: {
    marginTop: 20,
    display: "grid",
    gap: 18,
  },

  whyLine: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },

  whyIcon: {
    width: 28,
    minWidth: 28,
    height: 28,
    color: "#ff2a7c",
    marginTop: 2,
  },

  whyLineTitle: {
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: "0.12em",
    color: "#ff2a7c",
  },

  whyLineText: {
    marginTop: 7,
    color: "rgba(255,255,255,0.66)",
    fontSize: 15,
    lineHeight: 1.7,
  },

  disclaimerRow: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: 14,
  },

  ageBadgeCard: {
    borderRadius: 28,
    border: "1px solid rgba(255, 42, 124, 0.16)",
    background: "rgba(10, 10, 10, 0.96)",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  ageBadgeCircle: {
    width: 108,
    height: 108,
    borderRadius: "50%",
    border: "4px solid #ff2a7c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 34,
    fontWeight: 900,
    boxShadow: "0 0 22px rgba(255,42,124,0.18)",
  },

  ageOnlyText: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: "0.12em",
  },

  disclaimerCard: {
    borderRadius: 28,
    border: "1px solid rgba(255, 42, 124, 0.16)",
    background: "rgba(10, 10, 10, 0.96)",
    padding: 24,
  },

  disclaimerTitle: {
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: "0.16em",
    color: "#ff2a7c",
  },

  disclaimerText: {
    marginTop: 14,
    color: "rgba(255,255,255,0.66)",
    fontSize: 15,
    lineHeight: 1.9,
  },

  ctaBanner: {
    position: "relative",
    marginTop: 14,
    overflow: "hidden",
    borderRadius: 28,
    border: "1px solid rgba(255, 42, 124, 0.22)",
    backgroundImage:
      "linear-gradient(90deg, rgba(255,42,124,0.10), rgba(0,0,0,0.56), rgba(255,42,124,0.08)), url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1600&auto=format&fit=crop')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 0 44px rgba(255,42,124,0.08)",
  },

  ctaBannerOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(0,0,0,0.28), rgba(0,0,0,0.48), rgba(0,0,0,0.28))",
  },

  ctaBannerContent: {
    position: "relative",
    zIndex: 1,
    padding: "34px 28px",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 20,
    alignItems: "center",
  },

  ctaTitle: {
    fontSize: "clamp(30px, 3vw, 48px)",
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: "-0.04em",
  },

  ctaText: {
    marginTop: 12,
    color: "rgba(255,255,255,0.78)",
    fontSize: 16,
    lineHeight: 1.8,
    maxWidth: 820,
  },

  primaryLargeButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "18px 28px",
    borderRadius: 16,
    textDecoration: "none",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 900,
    letterSpacing: "0.08em",
    background: "linear-gradient(90deg, #ff2a7c 0%, #ff4f98 100%)",
    boxShadow: "0 18px 44px rgba(255, 42, 124, 0.34)",
  },

  footer: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr 1fr 1fr 1fr",
    gap: 20,
    borderRadius: 28,
    border: "1px solid rgba(255, 42, 124, 0.14)",
    background: "rgba(10, 10, 10, 0.96)",
    padding: 28,
  },

  footerBrandColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  footerLogo: {
    fontSize: 42,
    fontWeight: 900,
    letterSpacing: "-0.05em",
  },

  footerCopy: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 14,
  },

  footerColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  footerColumnTitle: {
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: "0.14em",
    color: "#ff2a7c",
  },

  footerLinkList: {
    display: "grid",
    gap: 10,
  },

  footerLinkItem: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 14,
    lineHeight: 1.5,
  },

  glowOne: {
    position: "fixed",
    top: -120,
    left: -120,
    width: 380,
    height: 380,
    borderRadius: "50%",
    background: "rgba(255, 42, 124, 0.12)",
    filter: "blur(80px)",
    pointerEvents: "none",
    zIndex: 0,
  },

  glowTwo: {
    position: "fixed",
    top: 120,
    right: -120,
    width: 420,
    height: 420,
    borderRadius: "50%",
    background: "rgba(168, 85, 247, 0.10)",
    filter: "blur(90px)",
    pointerEvents: "none",
    zIndex: 0,
  },

  glowThree: {
    position: "fixed",
    bottom: -160,
    left: "30%",
    width: 460,
    height: 460,
    borderRadius: "50%",
    background: "rgba(255, 42, 124, 0.06)",
    filter: "blur(110px)",
    pointerEvents: "none",
    zIndex: 0,
  },
};

function HomeIcon() {
  return (
    <SvgBox>
      <path
        d="M4 11.5 12 5l8 6.5M6.5 10.5V20h11v-9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgBox>
  );
}

function StudioIcon() {
  return (
    <SvgBox>
      <rect
        x="3"
        y="6"
        width="14"
        height="12"
        rx="2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M17 10.5 21 8v8l-4-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgBox>
  );
}

function CameraIcon() {
  return (
    <SvgBox>
      <path
        d="M4 8.5h4l1.6-2h4.8l1.6 2H20A2 2 0 0 1 22 10.5v7A2.5 2.5 0 0 1 19.5 20h-15A2.5 2.5 0 0 1 2 17.5v-7A2 2 0 0 1 4 8.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="14"
        r="3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </SvgBox>
  );
}

function HeartOutlineIcon() {
  return (
    <SvgBox>
      <path
        d="M12 20s-6.7-4.2-9-8c-1.8-3 .1-7 4-7 2.1 0 3.4 1.1 5 3 1.6-1.9 2.9-3 5-3 3.9 0 5.8 4 4 7-2.3 3.8-9 8-9 8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </SvgBox>
  );
}

function PlayLockIcon() {
  return (
    <SvgBox>
      <rect
        x="3"
        y="5"
        width="12"
        height="14"
        rx="2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M8 9.5v5l4-2.5-4-2.5Z" fill="currentColor" />
      <path
        d="M18.5 14.2v-1a2.5 2.5 0 1 1 5 0v1M17 15.2h8v4.3a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 17 19.5v-4.3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgBox>
  );
}

function ShieldIcon() {
  return (
    <SvgBox>
      <path
        d="M12 3l7 2.8v5.4c0 4.6-3.1 8.3-7 9.8-3.9-1.5-7-5.2-7-9.8V5.8L12 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </SvgBox>
  );
}

function ShieldCheckIcon() {
  return (
    <SvgBox>
      <path
        d="M12 3l7 2.8v5.4c0 4.6-3.1 8.3-7 9.8-3.9-1.5-7-5.2-7-9.8V5.8L12 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m8.8 12.3 2.1 2.1 4.4-4.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgBox>
  );
}

function UserPlusIcon() {
  return (
    <SvgBox>
      <circle
        cx="9"
        cy="8"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3.5 19c0-3 2.3-5 5.5-5s5.5 2 5.5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18 8h5M20.5 5.5v5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </SvgBox>
  );
}

function GrowthIcon() {
  return (
    <SvgBox>
      <path
        d="M4 20V12M10 20V9M16 20V13M22 20V5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 7.5 10.2 11 14 8l5.5-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgBox>
  );
}

function DollarIcon() {
  return (
    <SvgBox>
      <path
        d="M12 3v18M16.5 7.2c-.8-1-2.2-1.7-4-1.7-2.9 0-4.7 1.4-4.7 3.5 0 2.3 2 3.1 4.8 3.7 2.7.6 4.4 1.2 4.4 3.4 0 2.1-1.9 3.8-4.9 3.8-2 0-3.6-.7-4.7-1.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgBox>
  );
}

function MessageIcon() {
  return (
    <SvgBox>
      <path
        d="M4 6.5h16A2.5 2.5 0 0 1 22.5 9v7A2.5 2.5 0 0 1 20 18.5H10l-4.5 3v-3H4A2.5 2.5 0 0 1 1.5 16V9A2.5 2.5 0 0 1 4 6.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 11.5h10M7 14.5h6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </SvgBox>
  );
}

function HeartLockIcon() {
  return (
    <SvgBox>
      <path
        d="M11 20s-6.2-3.8-8.4-7.2C1 10.1 2.5 6.5 6.2 6.5c2 0 3.3 1.1 4.8 2.9 1.5-1.8 2.8-2.9 4.8-2.9 3.7 0 5.2 3.6 3.6 6.3-.6 1-1.4 2-2.5 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 15.2v-1a2.25 2.25 0 1 1 4.5 0v1M15.2 16.2h7.1v4a1.3 1.3 0 0 1-1.3 1.3h-4.5a1.3 1.3 0 0 1-1.3-1.3v-4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgBox>
  );
}

function LockTinyIcon() {
  return (
    <span
      style={{
        display: "inline-flex",
        width: 12,
        height: 12,
        color: "#ff77ae",
      }}
    >
      <LockIcon />
    </span>
  );
}

function LockIcon() {
  return (
    <SvgBox viewBox="0 0 24 24">
      <path
        d="M8 10V8a4 4 0 1 1 8 0v2M6 10h12v10H6V10Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgBox>
  );
}

function LockCircleIcon() {
  return (
    <SvgBox viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8.5 12V10.5a3.5 3.5 0 1 1 7 0V12M7.2 12h9.6v6H7.2v-6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgBox>
  );
}

function SvgBox({
  children,
  viewBox = "0 0 24 24",
}: {
  children: React.ReactNode;
  viewBox?: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      width="100%"
      height="100%"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}