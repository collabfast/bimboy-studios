import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
  import { SiteHeader } from "./components/site-header";
  import { SiteFooter } from "./components/site-footer";
  import { AgeGate } from "./components/age-gate";
  import { MobileBottomNav } from "./components/mobile-bottom-nav";
  import "./index.css";
  import Page_feed from "./pages/feed";
  import Page_library from "./pages/library";
  import Page_creator from "./pages/creator";
  import Page_studio from "./pages/studio";

  import Layout_admin from "./pages/_layout__admin";
import Layout_dashboard from "./pages/_layout__dashboard";
import Layout_studio_dashboard from "./pages/_layout__studio-dashboard";
  import Page_studio_dashboard__royalties from "./pages/studio-dashboard__royalties";
import Page_studio_dashboard__settings from "./pages/studio-dashboard__settings";
import Page_studio_dashboard__videos from "./pages/studio-dashboard__videos";
import Page_studio_dashboard__cast from "./pages/studio-dashboard__cast";
import Page_dashboard__royalties from "./pages/dashboard__royalties";
import Page_dashboard__earnings from "./pages/dashboard__earnings";
import Page_dashboard__settings from "./pages/dashboard__settings";
import Page_join__studio_member from "./pages/join__studio-member";
import Page_dashboard__content from "./pages/dashboard__content";
import Page_dashboard__profile from "./pages/dashboard__profile";
import Page_dashboard__uploads from "./pages/dashboard__uploads";
import Page_dashboard__videos from "./pages/dashboard__videos";
import Page_dashboard__exclusives from "./pages/dashboard__exclusives";
import Page_dashboard__consent from "./pages/dashboard__consent";
import Page_dashboard__analytics from "./pages/dashboard__analytics";
import Page_dashboard__ranking from "./pages/dashboard__ranking";
import Page_admin__royalties from "./pages/admin__royalties";
import Page_admin__creators from "./pages/admin__creators";
import Page_admin__reports from "./pages/admin__reports";
import Page_admin__studios from "./pages/admin__studios";
import Page_admin__videos from "./pages/admin__videos";
import Page_join__creator from "./pages/join__creator";
import Page_join__manager from "./pages/join__manager";
import Page_studios___studioSlug_ from "./pages/studios___studioSlug_";
import Page_videos___videoSlug_ from "./pages/videos___videoSlug_";
import Page_studio_dashboard from "./pages/studio-dashboard";
import Page_dashboard from "./pages/dashboard";
import Page_royalties from "./pages/royalties";
import Page_creators from "./pages/creators";
import Page_privacy from "./pages/privacy";
import Page_studios from "./pages/studios";
import Page_support from "./pages/support";
import Page_browse from "./pages/browse";
import Page_signup from "./pages/signup";
import Page_about from "./pages/about";
import Page_admin from "./pages/admin";
import Page_login from "./pages/login";
import Page_terms from "./pages/terms";
import Page_dmca from "./pages/dmca";
import Page_index from "./pages/index";
import Page__slug_ from "./pages/_slug_";

  function NotFound() {
    return (
      <div className="page-shell pt-16 pb-24">
        <h1 className="text-3xl font-bold text-white">404</h1>
        <p className="mt-2 text-white/70">This page does not exist.</p>
      </div>
    );
  }

  function Chrome({ children }: { children: React.ReactNode }) {
    const [loc] = useLocation();
    const isImmersive =
      loc === "/" ||
      loc === "/feed" ||
      loc === "/library" ||
      loc === "/studio" ||
      loc.startsWith("/c/");
    if (isImmersive) {
      return (
        <div className="relative immersive-shell">
          {children}
          <MobileBottomNav />
        </div>
      );
    }
    return (
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 pb-16">{children}</main>
        <SiteFooter />
      </div>
    );
  }

  export default function App() {
    return (
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AgeGate />
        <Chrome>
            <Switch>
          <Route path="/library"><Page_library /></Route>
          <Route path="/studio"><Page_studio /></Route>
          <Route path="/c/:handle"><Page_creator /></Route>
          <Route path="/studio-dashboard/royalties"><Layout_studio_dashboard><Page_studio_dashboard__royalties /></Layout_studio_dashboard></Route>
        <Route path="/studio-dashboard/settings"><Layout_studio_dashboard><Page_studio_dashboard__settings /></Layout_studio_dashboard></Route>
        <Route path="/studio-dashboard/videos"><Layout_studio_dashboard><Page_studio_dashboard__videos /></Layout_studio_dashboard></Route>
        <Route path="/studio-dashboard/cast"><Layout_studio_dashboard><Page_studio_dashboard__cast /></Layout_studio_dashboard></Route>
        <Route path="/dashboard/royalties"><Layout_dashboard><Page_dashboard__royalties /></Layout_dashboard></Route>
        <Route path="/dashboard/earnings"><Layout_dashboard><Page_dashboard__earnings /></Layout_dashboard></Route>
        <Route path="/dashboard/settings"><Layout_dashboard><Page_dashboard__settings /></Layout_dashboard></Route>
        <Route path="/join/studio-member"><Page_join__studio_member /></Route>
        <Route path="/dashboard/content"><Layout_dashboard><Page_dashboard__content /></Layout_dashboard></Route>
        <Route path="/dashboard/profile"><Layout_dashboard><Page_dashboard__profile /></Layout_dashboard></Route>
        <Route path="/dashboard/uploads"><Layout_dashboard><Page_dashboard__uploads /></Layout_dashboard></Route>
        <Route path="/dashboard/videos"><Layout_dashboard><Page_dashboard__videos /></Layout_dashboard></Route>
        <Route path="/dashboard/exclusives"><Layout_dashboard><Page_dashboard__exclusives /></Layout_dashboard></Route>
        <Route path="/dashboard/consent"><Layout_dashboard><Page_dashboard__consent /></Layout_dashboard></Route>
        <Route path="/dashboard/analytics"><Layout_dashboard><Page_dashboard__analytics /></Layout_dashboard></Route>
        <Route path="/dashboard/ranking"><Layout_dashboard><Page_dashboard__ranking /></Layout_dashboard></Route>
        <Route path="/admin/royalties"><Layout_admin><Page_admin__royalties /></Layout_admin></Route>
        <Route path="/admin/creators"><Layout_admin><Page_admin__creators /></Layout_admin></Route>
        <Route path="/admin/reports"><Layout_admin><Page_admin__reports /></Layout_admin></Route>
        <Route path="/admin/studios"><Layout_admin><Page_admin__studios /></Layout_admin></Route>
        <Route path="/admin/videos"><Layout_admin><Page_admin__videos /></Layout_admin></Route>
        <Route path="/join/creator"><Page_join__creator /></Route>
        <Route path="/join/manager"><Page_join__manager /></Route>
        <Route path="/studios/:studioSlug"><Page_studios___studioSlug_ /></Route>
        <Route path="/videos/:videoSlug"><Page_videos___videoSlug_ /></Route>
        <Route path="/studio-dashboard"><Layout_studio_dashboard><Page_studio_dashboard /></Layout_studio_dashboard></Route>
        <Route path="/dashboard"><Layout_dashboard><Page_dashboard /></Layout_dashboard></Route>
        <Route path="/royalties"><Page_royalties /></Route>
        <Route path="/creators"><Page_creators /></Route>
        <Route path="/privacy"><Page_privacy /></Route>
        <Route path="/studios"><Page_studios /></Route>
        <Route path="/support"><Page_support /></Route>
        <Route path="/browse"><Page_browse /></Route>
        <Route path="/signup"><Page_signup /></Route>
        <Route path="/about"><Page_about /></Route>
        <Route path="/admin"><Layout_admin><Page_admin /></Layout_admin></Route>
        <Route path="/login"><Page_login /></Route>
        <Route path="/terms"><Page_terms /></Route>
        <Route path="/dmca"><Page_dmca /></Route>
        <Route path="/feed"><Page_feed /></Route>
        <Route path="/welcome"><Page_index /></Route>
        <Route path="/"><Page_feed /></Route>
        <Route path="/:slug"><Page__slug_ /></Route>
              <Route><NotFound /></Route>
            </Switch>
        </Chrome>
      </WouterRouter>
    );
  }
  