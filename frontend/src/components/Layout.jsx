import TopHeader from "./TopHeader";
import BottomTabBar from "./BottomTabBar";
import AdSensePlaceholder from "./AdSensePlaceholder";
import Footer from "./Footer";

export default function Layout({ children, showTopAd = true }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopHeader />
      <main className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8">
        {showTopAd && (
          <div className="mb-5">
            <AdSensePlaceholder slot="banner" />
          </div>
        )}
        {children}
      </main>
      <Footer />
      <div className="safe-bottom" />
      <BottomTabBar />
    </div>
  );
}
