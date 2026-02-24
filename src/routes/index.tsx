import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {

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
      name: "Safety Supplies",
      handle: "safety-supplies",
      desc: "PPE and workplace safety essentials",
      img: "/safety-supplies.jpg",
    },
    {
      name: "School Wear",
      handle: "school-wear",
      desc: "Sports and institutional apparel",
      img: "/schoolwear.jpg",
    },
  ];

  const brands = [
    { name: "Carhartt", img: "/brands/carhart.png" },
    { name: "Timberland Pro", img: "/brands/timberland-pro.png" },
    { name: "Blakl\u00e4der", img: "/brands/blaklader.png" },
    { name: "Stormtech", img: "/brands/stormtech-logo.jpg" },
    { name: "Pioneer", img: "/brands/pioneer.png" },
    { name: "Viking", img: "/brands/viking_work_wear.png" },
    { name: "Big Bill", img: "/brands/big_bill_workwear.png" },
    { name: "Dickies", img: "/brands/dickies_workwear_ottawa.png" },
    { name: "Tough Duck", img: "/brands/TOUGHDUCK.png" },
    { name: "CX2", img: "/brands/CX2-Workwear.jpg" },
    { name: "Oberon", img: "/brands/oberon.jpg" },
    { name: "Orange River", img: "/brands/orange_river_logo.jpg" },
    { name: "Red Kap", img: "/brands/redkap.png" },
    { name: "Atlas", img: "/brands/atlas.png" },
    { name: "Baffin", img: "/brands/baffin.jpg" },
    { name: "Blundstone", img: "/brands/blunstone_logo.jpg" },
    { name: "Canada West", img: "/brands/canada-west-boots-logo-1.jpg" },
    { name: "Dunlop", img: "/brands/dunlop.png" },
    { name: "Irish Setter", img: "/brands/irish-setter.png" },
    { name: "JB Goodhue", img: "/brands/jb-goodhue.png" },
    { name: "Keen", img: "/brands/keen.png" },
    { name: "Mellow Walk", img: "/brands/mellow_wailk.jpg" },
    { name: "Muck", img: "/brands/muck.png" },
    { name: "Rasco", img: "/brands/rasco.png" },
    { name: "Redback", img: "/brands/redback.jpg" },
    { name: "Red Wing", img: "/brands/red-wing-shoes.jpg" },
    { name: "Royer", img: "/brands/royer.jpg" },
    { name: "STC", img: "/brands/stc.png" },
    { name: "Terra", img: "/brands/terra.png" },
    { name: "Vismo", img: "/brands/vismo-logo1-768x500.jpg" },
  ];

  const currentSlide = useSignal(0);
  const paused = useSignal(false);
  const touchStartX = useSignal(0);

  // Auto-advance through all slides once, then stop on slide 0
  useVisibleTask$(({ cleanup }) => {
    const lastIndex = 2;
    const id = setInterval(() => {
      if (paused.value) return;
      if (currentSlide.value < lastIndex) {
        currentSlide.value++;
      } else {
        currentSlide.value = 0;
        clearInterval(id);
      }
    }, 6000);
    cleanup(() => clearInterval(id));
  });

  const heroSlides = [
    {
      image: "/hero.jpg",
      badge: "Canada's Safety Experts",
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
      image: "/embroidery.jpg",
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
        onTouchStart$={(e: TouchEvent) => { touchStartX.value = e.touches[0].clientX; }}
        onTouchEnd$={(e: TouchEvent) => {
          const diff = touchStartX.value - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) {
            const last = heroSlides.length - 1;
            if (diff > 0 && currentSlide.value < last) {
              currentSlide.value++;
            } else if (diff < 0 && currentSlide.value > 0) {
              currentSlide.value--;
            }
          }
        }}
      >
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            class={`text-white py-24 md:py-20 px-8 text-center overflow-hidden transition-opacity duration-700 ease-in-out ${
              i === 0 ? "relative" : "absolute top-0 left-0 w-full h-full"
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
              <div class="hidden md:inline-block bg-primary/15 text-primary py-1.5 px-4 rounded-full text-xs font-bold tracking-widest uppercase mb-5 border border-primary/30">
                {slide.badge}
              </div>
              <h2 class="text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-4 [text-shadow:0_2px_12px_rgba(0,0,0,0.4)]">
                {slide.title}
              </h2>
              <p class="text-xl text-white/70 max-w-[520px] mx-auto mb-8 leading-relaxed">
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
      <section class="px-0 pt-2.5 pb-2.5">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-2.5">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/collections/${cat.handle}/`}
              class="group relative rounded overflow-hidden aspect-[4/3] md:aspect-square flex items-end p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src={cat.img}
                alt={cat.name}
                width={520}
                height={390}
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Bottom text gradient */}
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Edge vignette — fades card edges into the page background */}
              <div class="absolute inset-0 shadow-[inset_0_0_50px_15px_rgba(0,0,0,0.5)] dark:shadow-[inset_0_0_50px_15px_rgba(0,0,0,0.8)] pointer-events-none" />
              <div class="relative z-10">
                <h3 class="text-white text-2xl font-bold">{cat.name}</h3>
                <p class="text-white/60 text-base mt-1">{cat.desc}</p>
              </div>
              <span class="relative z-10 text-primary text-lg ml-auto transition-transform duration-200 group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Brands */}
      <div class="bg-white dark:bg-[#1e1e1e] border-y border-gray-200 dark:border-gray-700 py-12 px-4 md:px-8 text-center">
        <h2 class="text-xs uppercase tracking-[0.12em] text-gray-500 mb-8 font-semibold">
          Trusted Brands We Carry
        </h2>
        <div class="flex flex-wrap justify-center items-center gap-4 md:gap-6">
          {brands.map((brand) => (
            <img
              key={brand.name}
              src={brand.img}
              alt={brand.name}
              width={120}
              height={48}
              class="h-10 md:h-14 w-auto object-contain transition-all duration-200"
            />
          ))}
        </div>
      </div>

      {/* Value Props */}
      <section class="px-0 pb-2.5">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {[
            {
              img: "/footwear.jpg",
              title: "CSA Certified Quality",
              desc: "Premium CSA-approved footwear and workwear from Canada's most trusted brands.",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              ),
            },
            {
              img: "/embroidery.jpg",
              title: "Custom Embroidery",
              desc: "In-house embroidery and transfer services. Budget-conscious personalization for your team.",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  <path d="M8 7h8M8 11h6"/>
                </svg>
              ),
            },
            {
              img: "/hero.jpg",
              title: "Decades of Expertise",
              desc: "Years of successful apparel market experience with superior sourcing across Canada.",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  <path d="M21 21v-2a4 4 0 0 0-3-3.87"/>
                </svg>
              ),
            },
          ].map((card) => (
            <div key={card.title} class="relative overflow-hidden rounded aspect-[4/3] md:aspect-[3/2] flex items-center justify-center text-center">
              <img
                src={card.img}
                alt=""
                width={600}
                height={400}
                class="absolute inset-0 w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-black/60" />
              <div class="absolute inset-0 shadow-[inset_0_0_50px_15px_rgba(0,0,0,0.5)] dark:shadow-[inset_0_0_50px_15px_rgba(0,0,0,0.8)] pointer-events-none" />
              <div class="relative z-10 px-6 flex flex-col items-center">
                <div class="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm text-primary flex items-center justify-center mb-4 border border-white/20">
                  {card.icon}
                </div>
                <h3 class="text-white text-xl font-bold mb-2 tracking-tight">{card.title}</h3>
                <p class="text-white/60 text-sm leading-relaxed max-w-[280px]">{card.desc}</p>
              </div>
            </div>
          ))}
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
