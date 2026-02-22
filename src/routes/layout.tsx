import { component$, Slot } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      {/* Announcement Bar */}
      <div class="announcement-bar">
        <span>WE ARE OPEN</span> &mdash; 595 West Hunt Club Road, Nepean, ON
        &bull; Mon-Sat &bull; 613-224-6804
      </div>

      {/* Header */}
      <header class="site-header">
        <div class="header-inner">
          <Link href="/" class="site-logo">
            THE SAFETY<span class="logo-accent"> HOUSE</span>
          </Link>
          <nav class="site-nav">
            <Link href="/">Shop</Link>
            <Link href="/about/">About</Link>
            <Link href="/faq/">FAQ</Link>
            <Link href="/contact/">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <Slot />

      {/* Footer */}
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-grid">
            <div class="footer-brand">
              <h3>
                THE SAFETY <span>HOUSE</span>
              </h3>
              <p>
                Where work and lifestyle apparel intersect. Your one stop shop
                for quality specialized clothing, safety footwear, and in-house
                embroidery services.
              </p>
            </div>
            <div class="footer-col">
              <h4>Shop</h4>
              <Link href="/collections/work-wear/">Work Wear</Link>
              <Link href="/collections/safety-footwear/">Safety Footwear</Link>
              <Link href="/collections/safety-supplies/">Safety Supplies</Link>
              <Link href="/collections/flame-resistant/">Flame Resistant</Link>
              <Link href="/collections/school-wear/">School Wear</Link>
            </div>
            <div class="footer-col">
              <h4>Info</h4>
              <Link href="/about/">About Us</Link>
              <Link href="/faq/">FAQ</Link>
              <Link href="/contact/">Contact</Link>
            </div>
            <div class="footer-col">
              <h4>Visit Us</h4>
              <p>
                595 West Hunt Club Road
                <br />
                Nepean, ON K2G 5X6
                <br />
                <br />
                613-224-6804
                <br />
                info@safetyhouse.ca
              </p>
            </div>
          </div>
          <div class="footer-bottom">
            <span>&copy; {new Date().getFullYear()} The Safety House</span>
            <span>Powered by Qwik + Shopify</span>
          </div>
        </div>
      </footer>
    </>
  );
});
