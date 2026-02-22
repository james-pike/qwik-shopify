import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      {/* Hero */}
      <div class="bg-gradient-to-br from-dark to-[#2d2d2d] text-white py-20 md:py-28 px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">About Us</h1>
        <p class="text-white/60 text-base max-w-[520px] mx-auto leading-relaxed">
          Where work and lifestyle apparel intersect. Decades of experience
          serving Eastern Ontario with quality and care.
        </p>
      </div>

      {/* Section 1 — Image left, text right */}
      <section class="max-w-site mx-auto px-4 md:px-8 py-16 md:py-24">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div class="rounded-2xl overflow-hidden aspect-[4/3]">
            <img
              src="/footwear.jpg"
              alt="Safety footwear at The Safety House"
              width={600}
              height={450}
              class="w-full h-full object-cover"
            />
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.15em] text-primary font-bold mb-3">Who We Are</p>
            <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight mb-4 text-dark dark:text-white">
              The Safety House
            </h2>
            <p class="text-gray-500 dark:text-gray-400 leading-relaxed text-[0.95rem] mb-4">
              The Safety House focuses on offering key products on time by employing
              the latest technologies, selecting reliable suppliers, and maintaining
              personable staff to address customer needs.
            </p>
            <p class="text-gray-500 dark:text-gray-400 leading-relaxed text-[0.95rem]">
              We are your one stop shop for quality specialized clothing, safety
              footwear, and in-house embroidery services.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div class="max-w-site mx-auto px-8">
        <div class="border-t border-gray-200 dark:border-gray-800" />
      </div>

      {/* Section 2 — Text left, visual right */}
      <section class="max-w-site mx-auto px-4 md:px-8 py-16 md:py-24">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div class="order-2 md:order-1">
            <p class="text-xs uppercase tracking-[0.15em] text-primary font-bold mb-3">What We Do</p>
            <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight mb-4 text-dark dark:text-white">
              Apparel Supply &amp; Embroidery
            </h2>
            <p class="text-gray-500 dark:text-gray-400 leading-relaxed text-[0.95rem] mb-4">
              The Safety House specializes in apparel supply and embroidery for
              construction workwear, medical apparel, school team sports wear, and
              promotional products.
            </p>
            <p class="text-gray-500 dark:text-gray-400 leading-relaxed text-[0.95rem]">
              We offer quality footwear, protective clothing, and safety attire
              with personalization services all in one location.
            </p>
          </div>
          <div class="order-1 md:order-2 rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-dark to-[#2d2d2d] flex items-center justify-center p-10">
            <div class="text-center">
              <div class="text-5xl mb-4">&#9997;</div>
              <p class="text-white font-bold text-lg">Decoration Done Right</p>
              <p class="text-white/50 text-sm mt-1">In-house embroidery &amp; transfers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div class="max-w-site mx-auto px-8">
        <div class="border-t border-gray-200 dark:border-gray-800" />
      </div>

      {/* Section 3 — Visual left, text right */}
      <section class="max-w-site mx-auto px-4 md:px-8 py-16 md:py-24">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div class="rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-primary/90 to-primary-dark flex items-center justify-center p-10">
            <div class="text-center">
              <div class="text-5xl mb-4">&#9734;</div>
              <p class="text-white font-bold text-lg">Years of Experience</p>
              <p class="text-white/70 text-sm mt-1">Superior design, sourcing &amp; support</p>
            </div>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.15em] text-primary font-bold mb-3">Our Team</p>
            <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight mb-4 text-dark dark:text-white">
              The Experts
            </h2>
            <p class="text-gray-500 dark:text-gray-400 leading-relaxed text-[0.95rem] mb-4">
              Our management team brings years of successful apparel market
              experience. We emphasize superior design, sourcing, integrated
              promotion, and focused customer support with the highest integrity in
              the market.
            </p>
            <p class="text-gray-500 dark:text-gray-400 leading-relaxed text-[0.95rem]">
              From safety gear to school wear, our experts help you find exactly
              what you need with personalized attention to every order.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div class="max-w-site mx-auto px-8">
        <div class="border-t border-gray-200 dark:border-gray-800" />
      </div>

      {/* Section 4 — Text left, visual right */}
      <section class="max-w-site mx-auto px-4 md:px-8 py-16 md:py-24">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div class="order-2 md:order-1">
            <p class="text-xs uppercase tracking-[0.15em] text-primary font-bold mb-3">Our Commitment</p>
            <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight mb-4 text-dark dark:text-white">
              Promise &amp; Community
            </h2>
            <p class="text-gray-500 dark:text-gray-400 leading-relaxed text-[0.95rem] mb-4">
              We are committed to delivering products that meet customer needs
              through quality, unquestionable reliability, and superior customer
              service. We listen to our customers and anticipate their needs to
              ensure every experience exceeds expectations.
            </p>
            <p class="text-gray-500 dark:text-gray-400 leading-relaxed text-[0.95rem]">
              The Safety House maintains long-term relationships built on respect
              and fairness. We serve customers throughout Eastern Ontario via
              repeat business and referrals, and we're proud of the community
              we've built over the years.
            </p>
          </div>
          <div class="order-1 md:order-2 rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-[#1a2a1a] to-[#2e5a3a] flex items-center justify-center p-10">
            <div class="text-center">
              <div class="text-5xl mb-4">&#9874;</div>
              <p class="text-white font-bold text-lg">Eastern Ontario's Choice</p>
              <p class="text-white/60 text-sm mt-1">Built on trust, respect &amp; quality</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "About Us | The Safety House",
  meta: [
    {
      name: "description",
      content:
        "The Safety House - quality specialized clothing, CSA safety footwear, and in-house embroidery services in Nepean, Ontario.",
    },
  ],
};
