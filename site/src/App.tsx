import { useEffect } from "react";
import { AppProvider, useApp } from "@/lib/app-context";
import { SITE } from "@/data/site";
import Atmosphere from "@/components/site/Atmosphere";
import Cursor from "@/components/site/Cursor";
import DynamicIsland from "@/components/site/DynamicIsland";
import Footer from "@/components/site/Footer";
import Terminal from "@/components/terminal/Terminal";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Gaming from "@/components/sections/Gaming";
import Web from "@/components/sections/Web";
import Contact from "@/components/sections/Contact";
import Marquee from "@/components/motion/Marquee";

/** One long scroll-driven page: terminal boot → hero → about → gaming → web → contact. */
function Shell() {
  const { t, ui } = useApp();
  useEffect(() => { document.title = `${SITE.name} | ${t.home.badge}`; }, [t]);
  return (
    <>
      <a href="#about" className="sr-only z-[200] rounded-full bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">{ui.skipToContent}</a>
      <Atmosphere />
      <Terminal />
      <div id="site-root" className="relative">
        <DynamicIsland />
        <main className="relative z-10">
          <Hero />
          <About />
          <Marquee items={SITE.stack} />
          <Gaming />
          <Web />
          <Contact />
        </main>
        <Footer />
      </div>
      <Cursor />
    </>
  );
}

const App = () => (
  <AppProvider>
    <Shell />
  </AppProvider>
);
export default App;
