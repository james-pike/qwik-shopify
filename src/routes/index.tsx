import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { getProducts, formatPrice } from "~/lib/shopify";

export const useProducts = routeLoader$(async () => {
  return await getProducts(20);
});

export default component$(() => {
  const products = useProducts();

  const categories = [
    {
      name: "Work Wear",
      handle: "work-wear",
      desc: "Professional clothing for the job site",
      img: "/workwear.jpg",
    },
    {
      name: "Safety Footwear",
      handle: "safety-footwear",
      desc: "CSA-approved boots and shoes",
      img: "/footwear.jpg",
    },
    {
      name: "Flame Resistant",
      handle: "flame-resistant",
      desc: "Specialized protective garments",
      img: "/flame-resistant-clothing.jpg",
    },
    {
      name: "School Wear",
      handle: "school-wear",
      desc: "Sports and institutional apparel",
      img: "/schoolwear.jpg",
    },
    {
      name: "Safety Supplies",
      handle: "safety-supplies",
      desc: "PPE and workplace safety essentials",
      img: "/safety-supplies.jpg",
    },
  ];

  const brands = [
    "Carhartt",
    "Timberland Pro",
    "Red Wing",
    "Blundstone",
    "Blakl\u00e4der",
    "Stormtech",
    "Nike",
    "Adidas",
    "Royer",
    "Terra",
    "Keen",
    "Pioneer",
    "Viking",
    "Big Bill",
    "Dickies",
    "New Era",
    "Champion",
    "Roots",
  ];

  const currentSlide = useSignal(0);
  const paused = useSignal(false);

  // Auto-advance through all slides once, then stop on slide 0
  useVisibleTask$(({ track, cleanup }) => {
    track(() => paused.value);
    const lastIndex = 2;
    let done = false;
    const id = setInterval(() => {
      if (paused.value || done) return;
      if (currentSlide.value < lastIndex) {
        currentSlide.value++;
      } else {
        currentSlide.value = 0;
        done = true;
        clearInterval(id);
      }
    }, 6000);
    cleanup(() => clearInterval(id));
  });

  const heroSlides = [
    {
      image: "/hero.jpg",
      badge: "Eastern Ontario's Safety Experts",
      title: <>Where Work &amp; Lifestyle<br />Apparel <em class="not-italic text-primary">Intersect</em></>,
      description: "The Safety House is your one stop shop for quality specialized clothing, CSA safety footwear, and in-house embroidery services.",
      primaryLink: { href: "/#products", label: "Shop Products" },
      secondaryLink: { href: "/about/", label: "Our Story" },
    },
    {
      image: "/footwear.jpg",
      badge: "CSA Approved",
      title: <>Safety Footwear<br />Built to <em class="not-italic text-primary">Protect</em></>,
      description: "Browse our selection of CSA-approved boots and shoes from trusted brands like Timberland Pro, Red Wing, and Blundstone.",
      primaryLink: { href: "/collections/safety-footwear/", label: "Shop Footwear" },
      secondaryLink: { href: "/collections/work-wear/", label: "Work Wear" },
    },
    {
      image: "/flame-resistant-clothing.jpg",
      badge: "In-House Embroidery",
      title: <>Custom Decoration<br />for Your <em class="not-italic text-primary">Team</em></>,
      description: "Timely, budget-conscious embroidery and transfer services for your company, school, or organization.",
      primaryLink: { href: "/contact/", label: "Get a Quote" },
      secondaryLink: { href: "/#products", label: "Browse All" },
    },
  ];

  return (
    <>
      {/* Hero Carousel */}
      <section
        class="relative overflow-hidden"
        onMouseEnter$={() => { paused.value = true; }}
        onMouseLeave$={() => { paused.value = false; }}
      >
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            class={`text-white py-28 md:py-36 px-8 text-center overflow-hidden transition-opacity duration-700 ease-in-out ${
              i === 0 ? "relative" : "absolute inset-0"
            } ${currentSlide.value === i ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            aria-hidden={currentSlide.value !== i}
          >
            <img
              src={slide.image}
              alt=""
              width={1400}
              height={600}
              class="absolute inset-0 w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-br from-dark/60 to-[#2d2d2d]/50" />
            <div class="relative z-10 max-w-[720px] mx-auto">
              <div class="inline-block bg-primary/15 text-primary py-1.5 px-4 rounded-full text-xs font-bold tracking-widest uppercase mb-5 border border-primary/30">
                {slide.badge}
              </div>
              <h2 class="text-[2rem] md:text-5xl font-extrabold leading-[1.1] tracking-tight mb-4 [text-shadow:0_2px_12px_rgba(0,0,0,0.4)]">
                {slide.title}
              </h2>
              <p class="text-lg text-white/70 max-w-[520px] mx-auto mb-8 leading-relaxed">
                {slide.description}
              </p>
              <div class="flex gap-4 justify-center flex-wrap">
                <Link
                  href={slide.primaryLink.href}
                  class="inline-flex items-center justify-center py-3 px-7 text-[0.9rem] font-semibold rounded-lg border-none transition-all duration-200 bg-primary text-white hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {slide.primaryLink.label}
                </Link>
                <Link
                  href={slide.secondaryLink.href}
                  class="inline-flex items-center justify-center py-3 px-7 text-[0.9rem] font-semibold rounded-lg transition-all duration-200 bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white/50"
                >
                  {slide.secondaryLink.label}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Dot indicators */}
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              class={`w-2.5 h-2.5 rounded-full border-none cursor-pointer transition-all duration-300 ${
                currentSlide.value === i
                  ? "bg-white scale-110"
                  : "bg-white/40 hover:bg-white/70"
              }`}
              onClick$={() => { currentSlide.value = i; }}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section class="px-4 md:px-8 py-16 md:py-20">
        <div class="text-center mb-10">
          <h2 class="text-[1.75rem] font-extrabold tracking-tight mb-2">
            Explore Essentials
          </h2>
          {/* <p class="text-gray-500 dark:text-gray-400 text-base max-w-[480px] mx-auto">
            From the job site to the classroom, we've got you covered.
          </p> */}
        </div>
        <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/collections/${cat.handle}/`}
              class="group relative rounded-xl overflow-hidden aspect-[4/3] md:aspect-square flex items-end p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src={cat.img}
                alt={cat.name}
                width={520}
                height={390}
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div class="relative z-10">
                <h3 class="text-white text-lg font-bold">{cat.name}</h3>
                <p class="text-white/60 text-xs mt-1">{cat.desc}</p>
              </div>
              <span class="relative z-10 text-primary text-lg ml-auto transition-transform duration-200 group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Brands */}
      <div class="bg-white dark:bg-[#1e1e1e] border-y border-gray-200 dark:border-gray-700 py-12 px-8 text-center">
        <h2 class="text-xs uppercase tracking-[0.12em] text-gray-500 mb-6 font-semibold">
          Trusted Brands We Carry
        </h2>
        <div class="flex flex-wrap justify-center gap-3">
          {brands.map((brand) => (
            <span
              key={brand}
              class="text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 rounded-full px-4 py-2 transition-colors hover:text-dark hover:bg-gray-200 dark:hover:text-white dark:hover:bg-white/10"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      {/* Products */}
      <section class="px-4 md:px-8 py-16 md:py-20" id="products">
        <div class="text-center mb-10">
          <h2 class="text-[1.75rem] font-extrabold tracking-tight mb-2">
            Our Products
          </h2>
          <p class="text-gray-500 dark:text-gray-400 text-base max-w-[480px] mx-auto">
            Quality workwear, safety gear, and more.
          </p>
        </div>

        {products.value.length === 0 ? (
          <p class="text-center text-gray-500 dark:text-gray-400">No products found.</p>
        ) : (
          <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
            {products.value.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.handle}/`}
                class="group bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col"
              >
                {product.featuredImage ? (
                  <img
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                    width={400}
                    height={400}
                    class="w-full h-[280px] object-cover bg-gray-100 dark:bg-gray-800 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div class="w-full h-[280px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-sm">
                    No image
                  </div>
                )}
                <div class="p-4 px-5 flex-1 flex flex-col">
                  <h3 class="text-[0.95rem] font-semibold mb-1 leading-snug">
                    {product.title}
                  </h3>
                  <span class="text-base font-bold text-primary mt-auto pt-2">
                    {formatPrice(product.priceRange.minVariantPrice)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Why The Safety House */}
      <section class="px-4 md:px-8 py-16 md:py-20">
        <div class="text-center mb-10">
          <h2 class="text-[1.75rem] font-extrabold tracking-tight mb-2">
            Why The Safety House?
          </h2>
          <p class="text-gray-500 dark:text-gray-400 text-base max-w-[480px] mx-auto">
            Decades of experience serving Eastern Ontario.
          </p>
        </div>
        <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          <div class="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-xl p-8 transition-shadow duration-200 hover:shadow">
            <div class="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 class="text-base font-bold mb-2">Quality CSA Gear</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              We focus on the best quality CSA footwear and clothing on the
              market from brands like Timberland Pro, Red Wing, Blundstone, and
              more.
            </p>
          </div>
          <div class="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-xl p-8 transition-shadow duration-200 hover:shadow">
            <div class="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
            </div>
            <h3 class="text-base font-bold mb-2">Decoration Done Right</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              In-house embroidery and transfer services. Timely, budget-conscious
              personalization for your team, school, or company.
            </p>
          </div>
          <div class="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-xl p-8 transition-shadow duration-200 hover:shadow">
            <div class="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <h3 class="text-base font-bold mb-2">Expert Service</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Our management team brings years of successful apparel market
              experience with superior design, sourcing, and focused customer
              support.
            </p>
          </div>
        </div>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "The Safety House | Where Work & Lifestyle Apparel Intersect",
  meta: [
    {
      name: "description",
      content:
        "The Safety House is your one stop shop for quality specialized clothing, CSA safety footwear, and in-house embroidery services in Nepean, Ontario.",
    },
  ],
};
