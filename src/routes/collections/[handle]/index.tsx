import { component$, useSignal, useComputed$, $, useOnDocument, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, Link, useLocation } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { getCollectionByHandle, getCollectionProducts, formatPrice } from "~/lib/medusa";
import type { ShopifyProduct } from "~/lib/medusa";

const SORT_OPTIONS = [
  { value: "newest", label: "New Arrivals", icon: "M12 8v4l3 3" },
  { value: "price-asc", label: "Price: Low to High", icon: "M3 17l6-6 4 4 8-8" },
  { value: "price-desc", label: "Price: High to Low", icon: "M3 7l6 6 4-4 8 8" },
  { value: "brand-asc", label: "Brand: A\u2013Z", icon: "M3 6h18M3 12h12M3 18h6" },
  { value: "title-asc", label: "Name: A\u2013Z", icon: "M3 6h18M3 12h12M3 18h6" },
  { value: "best-selling", label: "Popular", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
];

function sortProducts(products: ShopifyProduct[], sortValue: string): ShopifyProduct[] {
  if (!sortValue) return products;
  const sorted = [...products];
  switch (sortValue) {
    case "price-asc":
      return sorted.sort((a, b) =>
        parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount));
    case "price-desc":
      return sorted.sort((a, b) =>
        parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount));
    case "brand-asc":
      return sorted.sort((a, b) => (a.vendor || "").localeCompare(b.vendor || "") || a.title.localeCompare(b.title));
    case "title-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "newest":
      return sorted.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "best-selling":
      return products;
    default:
      return products;
  }
}

export const useCollection = routeLoader$(async (requestEvent) => {
  const handle = requestEvent.params.handle;
  const collection = await getCollectionByHandle(handle, 100);

  if (!collection) {
    requestEvent.status(404);
    return null;
  }

  return collection;
});

export default component$(() => {
  const collection = useCollection();
  const location = useLocation();
  const currentSort = useSignal(location.url.searchParams.get("sort") || "newest");
  const gridCols = useSignal<1 | 2 | 3 | 4>(4);

  // Filter state
  const selectedBrands = useSignal<string[]>([]);
  const selectedTypes = useSignal<string[]>([]);
  const selectedSizes = useSignal<string[]>([]);
  const inStockOnly = useSignal(false);
  const priceMin = useSignal("");
  const priceMax = useSignal("");
  const mobileFiltersOpen = useSignal(false);

  // Sidebar section collapse state (desktop)
  const sectionOpen = useSignal<Record<string, boolean>>({
    sort: true,
    type: true,
    brand: true,
    size: true,
    price: true,
    availability: true,
  });

  const toggleSection = $((key: string) => {
    sectionOpen.value = { ...sectionOpen.value, [key]: !sectionOpen.value[key] };
  });

  if (!collection.value) {
    return (
      <div class="text-center py-24 px-8">
        <h1 class="text-2xl font-bold mb-4">Collection not found</h1>
        <Link
          href="/"
          class="inline-flex items-center justify-center py-3 px-7 text-[0.9rem] font-semibold rounded-lg border-none transition-all duration-200 bg-primary text-white hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const c = collection.value;

  // Pagination state
  const loadedProducts = useSignal<ShopifyProduct[]>(c.products.edges.map((e) => e.node));
  const endCursor = useSignal<string | null>(c.products.pageInfo.endCursor);
  const hasNextPage = useSignal(c.products.pageInfo.hasNextPage);
  const loadingMore = useSignal(false);

  const loadMore = $(async () => {
    if (!hasNextPage.value || loadingMore.value) return;
    loadingMore.value = true;
    try {
      const result = await getCollectionProducts(c.handle, 100, endCursor.value || undefined);
      loadedProducts.value = [...loadedProducts.value, ...result.products];
      endCursor.value = result.pageInfo.endCursor;
      hasNextPage.value = result.pageInfo.hasNextPage;
    } catch (err) {
      console.error("Failed to load more products:", err);
    } finally {
      loadingMore.value = false;
    }
  });

  // Derive filter options from products
  const brands = useComputed$(() => {
    const vendorSet = new Set<string>();
    for (const p of loadedProducts.value) {
      if (p.vendor) vendorSet.add(p.vendor);
    }
    return [...vendorSet].sort();
  });

  const productTypes = useComputed$(() => {
    const typeSet = new Set<string>();
    for (const p of loadedProducts.value) {
      if (p.productType) typeSet.add(p.productType);
    }
    return [...typeSet].sort();
  });

  const sizes = useComputed$(() => {
    const sizeSet = new Set<string>();
    for (const p of loadedProducts.value) {
      if (!p.options) continue;
      const sizeOpt = p.options.find((o) => o.name.toLowerCase() === "size");
      if (sizeOpt) {
        for (const v of sizeOpt.values) sizeSet.add(v);
      }
    }
    return [...sizeSet];
  });

  const activeFilterCount = useComputed$(() => {
    let count = 0;
    if (selectedBrands.value.length > 0) count += selectedBrands.value.length;
    if (selectedTypes.value.length > 0) count += selectedTypes.value.length;
    if (selectedSizes.value.length > 0) count += selectedSizes.value.length;
    if (inStockOnly.value) count++;
    if (priceMin.value || priceMax.value) count++;
    return count;
  });

  const clearAllFilters = $(() => {
    selectedBrands.value = [];
    selectedTypes.value = [];
    selectedSizes.value = [];
    inStockOnly.value = false;
    priceMin.value = "";
    priceMax.value = "";
  });

  const filteredProducts = useComputed$(() => {
    const sorted = sortProducts(loadedProducts.value, currentSort.value);
    let result = sorted;

    if (selectedBrands.value.length > 0) {
      result = result.filter((p: ShopifyProduct) => selectedBrands.value.includes(p.vendor));
    }
    if (selectedTypes.value.length > 0) {
      result = result.filter((p: ShopifyProduct) => selectedTypes.value.includes(p.productType));
    }
    if (selectedSizes.value.length > 0) {
      result = result.filter((p: ShopifyProduct) => {
        if (!p.options) return false;
        const sizeOpt = p.options.find((o) => o.name.toLowerCase() === "size");
        if (!sizeOpt) return false;
        return sizeOpt.values.some((v) => selectedSizes.value.includes(v));
      });
    }
    if (inStockOnly.value) {
      result = result.filter((p: ShopifyProduct) => p.availableForSale);
    }
    if (priceMin.value) {
      const min = parseFloat(priceMin.value);
      if (!isNaN(min)) result = result.filter((p) => parseFloat(p.priceRange.minVariantPrice.amount) >= min);
    }
    if (priceMax.value) {
      const max = parseFloat(priceMax.value);
      if (!isNaN(max)) result = result.filter((p) => parseFloat(p.priceRange.minVariantPrice.amount) <= max);
    }
    return result;
  });

  // Hero
  const heroData: Record<string, { subtitle?: string; img2?: string }> = {
    "work-wear": { img2: "/workwear.jpg" },
    "safety-footwear": {
      subtitle: "CSA-approved boots and shoes from trusted brands.",
      img2: "/footwear.jpg",
    },
    "flame-resistant": { img2: "/flame-resistant-clothing.jpg" },
    "safety-supplies": { img2: "/safety-supplies.jpg" },
    "school-wear": { img2: "/schoolwear.jpg" },
  };
  const hero = heroData[c.handle] || {};
  const heroImg = c.image?.url;
  const heroImg2 = hero.img2 || null;
  const heroImages = [heroImg, heroImg2].filter(Boolean) as string[];
  const heroSlide = useSignal(0);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (heroImages.length < 2) return;
    const id = setInterval(() => {
      heroSlide.value = heroSlide.value === 0 ? 1 : 0;
    }, 5000);
    cleanup(() => clearInterval(id));
  });

  // Shared filter sidebar content (used in desktop sidebar and mobile drawer)
  const FilterContent = () => (
    <div class="space-y-0.5">
      {/* Sort */}
      <div class="border-b border-gray-200 dark:border-gray-700/50">
        <button
          type="button"
          class="w-full flex items-center justify-between py-3 px-1 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          onClick$={() => toggleSection("sort")}
        >
          Sort By
          <svg class={`w-3.5 h-3.5 transition-transform duration-200 ${sectionOpen.value.sort ? "" : "-rotate-90"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {sectionOpen.value.sort && (
          <div class="pb-3 space-y-0.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                class={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition-all duration-150 ${
                  currentSort.value === opt.value
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
                onClick$={() => {
                  currentSort.value = opt.value;
                  const url = new URL(window.location.href);
                  url.searchParams.set("sort", opt.value);
                  history.replaceState(null, "", url.pathname + url.search);
                }}
              >
                <svg class="w-4 h-4 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                  <path d={opt.icon} />
                </svg>
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Type */}
      {productTypes.value.length > 0 && (
        <div class="border-b border-gray-200 dark:border-gray-700/50">
          <button
            type="button"
            class="w-full flex items-center justify-between py-3 px-1 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            onClick$={() => toggleSection("type")}
          >
            <span class="flex items-center gap-2">
              Type
              {selectedTypes.value.length > 0 && (
                <span class="bg-primary text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none">
                  {selectedTypes.value.length}
                </span>
              )}
            </span>
            <svg class={`w-3.5 h-3.5 transition-transform duration-200 ${sectionOpen.value.type ? "" : "-rotate-90"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {sectionOpen.value.type && (
            <div class="pb-3 space-y-0.5 max-h-[240px] overflow-y-auto">
              {productTypes.value.map((type) => (
                <label
                  key={type}
                  class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    class="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary/50 w-4 h-4"
                    checked={selectedTypes.value.includes(type)}
                    onChange$={() => {
                      const current = [...selectedTypes.value];
                      const idx = current.indexOf(type);
                      if (idx >= 0) current.splice(idx, 1);
                      else current.push(type);
                      selectedTypes.value = current;
                    }}
                  />
                  <span class="flex-1">{type}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Brand */}
      {brands.value.length > 0 && (
        <div class="border-b border-gray-200 dark:border-gray-700/50">
          <button
            type="button"
            class="w-full flex items-center justify-between py-3 px-1 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            onClick$={() => toggleSection("brand")}
          >
            <span class="flex items-center gap-2">
              Brand
              {selectedBrands.value.length > 0 && (
                <span class="bg-primary text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none">
                  {selectedBrands.value.length}
                </span>
              )}
            </span>
            <svg class={`w-3.5 h-3.5 transition-transform duration-200 ${sectionOpen.value.brand ? "" : "-rotate-90"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {sectionOpen.value.brand && (
            <div class="pb-3 space-y-0.5 max-h-[240px] overflow-y-auto">
              {brands.value.map((brand) => (
                <label
                  key={brand}
                  class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    class="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary/50 w-4 h-4"
                    checked={selectedBrands.value.includes(brand)}
                    onChange$={() => {
                      const current = [...selectedBrands.value];
                      const idx = current.indexOf(brand);
                      if (idx >= 0) current.splice(idx, 1);
                      else current.push(brand);
                      selectedBrands.value = current;
                    }}
                  />
                  <span class="flex-1">{brand}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Size */}
      {sizes.value.length > 0 && (
        <div class="border-b border-gray-200 dark:border-gray-700/50">
          <button
            type="button"
            class="w-full flex items-center justify-between py-3 px-1 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            onClick$={() => toggleSection("size")}
          >
            <span class="flex items-center gap-2">
              Size
              {selectedSizes.value.length > 0 && (
                <span class="bg-primary text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none">
                  {selectedSizes.value.length}
                </span>
              )}
            </span>
            <svg class={`w-3.5 h-3.5 transition-transform duration-200 ${sectionOpen.value.size ? "" : "-rotate-90"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {sectionOpen.value.size && (
            <div class="pb-3">
              <div class="flex flex-wrap gap-1.5 px-1">
                {sizes.value.map((size) => (
                  <button
                    key={size}
                    type="button"
                    class={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                      selectedSizes.value.includes(size)
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                    onClick$={() => {
                      const current = [...selectedSizes.value];
                      const idx = current.indexOf(size);
                      if (idx >= 0) current.splice(idx, 1);
                      else current.push(size);
                      selectedSizes.value = current;
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      <div class="border-b border-gray-200 dark:border-gray-700/50">
        <button
          type="button"
          class="w-full flex items-center justify-between py-3 px-1 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          onClick$={() => toggleSection("price")}
        >
          <span class="flex items-center gap-2">
            Price
            {(priceMin.value || priceMax.value) && (
              <span class="bg-primary text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none">1</span>
            )}
          </span>
          <svg class={`w-3.5 h-3.5 transition-transform duration-200 ${sectionOpen.value.price ? "" : "-rotate-90"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {sectionOpen.value.price && (
          <div class="pb-3 px-1">
            <div class="flex items-center gap-2">
              <div class="relative flex-1">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                <input
                  type="number"
                  placeholder="Min"
                  class="w-full pl-6 pr-2 py-2 text-sm bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-gray-900 dark:text-white placeholder:text-gray-400"
                  value={priceMin.value}
                  onInput$={(_, el) => { priceMin.value = el.value; }}
                />
              </div>
              <span class="text-gray-400 text-xs">&ndash;</span>
              <div class="relative flex-1">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                <input
                  type="number"
                  placeholder="Max"
                  class="w-full pl-6 pr-2 py-2 text-sm bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-gray-900 dark:text-white placeholder:text-gray-400"
                  value={priceMax.value}
                  onInput$={(_, el) => { priceMax.value = el.value; }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Availability */}
      <div>
        <button
          type="button"
          class="w-full flex items-center justify-between py-3 px-1 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          onClick$={() => toggleSection("availability")}
        >
          Availability
          <svg class={`w-3.5 h-3.5 transition-transform duration-200 ${sectionOpen.value.availability ? "" : "-rotate-90"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {sectionOpen.value.availability && (
          <div class="pb-3 px-1">
            <label class="flex items-center gap-3 cursor-pointer group">
              <div class={`relative w-10 h-[22px] rounded-full transition-colors duration-200 ${inStockOnly.value ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`}>
                <div class={`absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200 ${inStockOnly.value ? "translate-x-[20px]" : "translate-x-0.5"}`} />
                <input
                  type="checkbox"
                  class="sr-only"
                  checked={inStockOnly.value}
                  onChange$={() => { inStockOnly.value = !inStockOnly.value; }}
                />
              </div>
              <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">In stock only</span>
            </label>
          </div>
        )}
      </div>

      {/* Clear all */}
      {activeFilterCount.value > 0 && (
        <div class="pt-3">
          <button
            type="button"
            class="w-full py-2.5 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all"
            onClick$={clearAllFilters}
          >
            Clear all filters ({activeFilterCount.value})
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Hero */}
      <div class="relative text-white aspect-video md:aspect-auto md:h-[33vh] md:max-h-[340px] px-8 text-center overflow-hidden flex flex-col items-center justify-center">
        {heroImages.length > 0 ? (
          heroImages.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={c.image?.altText || ""}
              width={1400}
              height={600}
              fetchPriority={i === 0 ? "high" : "auto"}
              class={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${heroSlide.value === i ? "opacity-100" : "opacity-0"}`}
            />
          ))
        ) : null}
        <div class="absolute inset-0 bg-gradient-to-br from-dark/60 to-[#2d2d2d]/50" />
        {heroImages.length === 0 && (
          <div class="absolute inset-0 bg-gradient-to-br from-dark to-[#2d2d2d]" />
        )}
        <h1 class="relative z-10 text-4xl md:text-5xl font-extrabold tracking-tight mb-3">{c.title}</h1>
        {hero.subtitle ? (
          <p class="relative z-10 text-white/60 text-lg max-w-[560px] mx-auto leading-relaxed">{hero.subtitle}</p>
        ) : (
          c.description && <p class="relative z-10 text-white/60 text-lg max-w-[560px] mx-auto leading-relaxed">{c.description}</p>
        )}
      </div>

      {/* Main layout: sidebar + grid */}
      <div class="flex">
        {/* Desktop sidebar */}
        <aside class="hidden lg:block w-[260px] xl:w-[280px] flex-shrink-0 border-r border-gray-200 dark:border-gray-700/40 bg-white dark:bg-[#161616] sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto">
          <div class="p-5">
            {/* Sidebar header */}
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Filters</h2>
              </div>
              {activeFilterCount.value > 0 && (
                <span class="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {activeFilterCount.value} active
                </span>
              )}
            </div>
            <FilterContent />
          </div>
        </aside>

        {/* Product grid area */}
        <div class="flex-1 min-w-0">
          {/* Toolbar */}
          <div class="bg-white dark:bg-[#1a1a1a] border-b border-gray-200/60 dark:border-gray-700/40 px-4 md:px-6 py-3 sticky top-[60px] z-20">
            <div class="flex items-center justify-between">
              {/* Breadcrumbs */}
              <nav class="flex items-center gap-1.5 text-xs md:text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
                <Link href="/#products" class="hover:text-dark dark:hover:text-white transition-colors">Collections</Link>
                <svg class="w-3 h-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                <span class="font-medium text-gray-900 dark:text-white">{c.title}</span>
              </nav>

              <div class="flex items-center gap-3">
                {/* Product count */}
                <span class="hidden md:inline text-xs text-gray-400 dark:text-gray-500">
                  {activeFilterCount.value > 0
                    ? `${filteredProducts.value.length} of ${loadedProducts.value.length}`
                    : `${loadedProducts.value.length}`} products
                </span>

                {/* Grid toggle (desktop) */}
                <div class="hidden md:flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {([3, 4] as const).map((cols) => (
                    <button
                      key={cols}
                      type="button"
                      aria-label={`${cols} column grid`}
                      class={`p-1.5 transition-colors ${gridCols.value === cols ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" : "bg-white dark:bg-[#1e1e1e] text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                      onClick$={() => { gridCols.value = cols; }}
                    >
                      {cols === 3 ? (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                          <rect x="1" y="1" width="4" height="4" rx="0.5" /><rect x="6" y="1" width="4" height="4" rx="0.5" /><rect x="11" y="1" width="4" height="4" rx="0.5" />
                          <rect x="1" y="6" width="4" height="4" rx="0.5" /><rect x="6" y="6" width="4" height="4" rx="0.5" /><rect x="11" y="6" width="4" height="4" rx="0.5" />
                          <rect x="1" y="11" width="4" height="4" rx="0.5" /><rect x="6" y="11" width="4" height="4" rx="0.5" /><rect x="11" y="11" width="4" height="4" rx="0.5" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                          <rect x="1" y="1" width="3" height="3" rx="0.5" /><rect x="5" y="1" width="3" height="3" rx="0.5" /><rect x="9" y="1" width="3" height="3" rx="0.5" /><rect x="13" y="1" width="2" height="3" rx="0.5" />
                          <rect x="1" y="5" width="3" height="3" rx="0.5" /><rect x="5" y="5" width="3" height="3" rx="0.5" /><rect x="9" y="5" width="3" height="3" rx="0.5" /><rect x="13" y="5" width="2" height="3" rx="0.5" />
                          <rect x="1" y="9" width="3" height="3" rx="0.5" /><rect x="5" y="9" width="3" height="3" rx="0.5" /><rect x="9" y="9" width="3" height="3" rx="0.5" /><rect x="13" y="9" width="2" height="3" rx="0.5" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>

                {/* Mobile grid toggle */}
                <div class="md:hidden flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {([1, 2] as const).map((cols) => (
                    <button
                      key={cols}
                      type="button"
                      class={`p-1.5 transition-colors ${gridCols.value === cols ? "bg-gray-100 dark:bg-gray-700" : "bg-white dark:bg-[#1e1e1e] hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                      onClick$={() => { gridCols.value = cols as 1 | 2 | 3 | 4; }}
                    >
                      {cols === 1 ? (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="14" height="6" rx="1" /><rect x="1" y="9" width="14" height="6" rx="1" /></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
                      )}
                    </button>
                  ))}
                </div>

                {/* Mobile filter button */}
                <button
                  type="button"
                  class="lg:hidden flex items-center gap-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                  onClick$={() => { mobileFiltersOpen.value = true; }}
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                  </svg>
                  Filters
                  {activeFilterCount.value > 0 && (
                    <span class="bg-primary text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none">
                      {activeFilterCount.value}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Active filter tags */}
            {activeFilterCount.value > 0 && (
              <div class="flex flex-wrap gap-1.5 mt-2.5">
                {selectedBrands.value.map((brand) => (
                  <span key={`brand-${brand}`} class="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full pl-2.5 pr-1.5 py-0.5">
                    {brand}
                    <button type="button" class="hover:text-red-500 transition-colors bg-transparent border-none p-0 text-gray-400" onClick$={() => { selectedBrands.value = selectedBrands.value.filter((b) => b !== brand); }}>
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
                {selectedTypes.value.map((type) => (
                  <span key={`type-${type}`} class="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full pl-2.5 pr-1.5 py-0.5">
                    {type}
                    <button type="button" class="bg-transparent border-none p-0 text-gray-400 hover:text-red-500 transition-colors" onClick$={() => { selectedTypes.value = selectedTypes.value.filter((t) => t !== type); }}>
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
                {selectedSizes.value.map((size) => (
                  <span key={`size-${size}`} class="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full pl-2.5 pr-1.5 py-0.5">
                    Size: {size}
                    <button type="button" class="bg-transparent border-none p-0 text-gray-400 hover:text-red-500 transition-colors" onClick$={() => { selectedSizes.value = selectedSizes.value.filter((s) => s !== size); }}>
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
                {(priceMin.value || priceMax.value) && (
                  <span class="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full pl-2.5 pr-1.5 py-0.5">
                    ${priceMin.value || "0"} &ndash; ${priceMax.value || "\u221E"}
                    <button type="button" class="bg-transparent border-none p-0 text-gray-400 hover:text-red-500 transition-colors" onClick$={() => { priceMin.value = ""; priceMax.value = ""; }}>
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
                {inStockOnly.value && (
                  <span class="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full pl-2.5 pr-1.5 py-0.5">
                    In Stock
                    <button type="button" class="bg-transparent border-none p-0 text-gray-400 hover:text-red-500 transition-colors" onClick$={() => { inStockOnly.value = false; }}>
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Product grid */}
          <section class="px-4 md:px-6 py-5 md:py-6">
            {filteredProducts.value.length === 0 ? (
              <div class="text-center py-16">
                <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <p class="text-gray-500 dark:text-gray-400 mb-2">
                  {loadedProducts.value.length === 0
                    ? "No products in this collection yet."
                    : "No products match your filters."}
                </p>
                {activeFilterCount.value > 0 && (
                  <button
                    type="button"
                    class="text-sm text-primary font-medium hover:underline bg-transparent border-none"
                    onClick$={clearAllFilters}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div class={`grid gap-1 md:gap-1.5 ${
                gridCols.value === 1
                  ? "grid-cols-1"
                  : gridCols.value === 2
                    ? "grid-cols-2"
                    : gridCols.value === 3
                      ? "grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-2 lg:grid-cols-4"
              }`}>
                {filteredProducts.value.map((product: ShopifyProduct) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.handle}/?collection=${c.handle}`}
                    class="group bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col"
                  >
                    <div class="relative overflow-hidden">
                      {product.featuredImage ? (
                        <img
                          src={product.featuredImage.url}
                          alt={product.featuredImage.altText || product.title}
                          width={400}
                          height={400}
                          class="w-full aspect-square object-cover bg-gray-100 dark:bg-gray-800 transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div class="w-full aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-sm">
                          No image
                        </div>
                      )}
                      {!product.availableForSale && (
                        <div class="absolute top-2 left-2 bg-gray-900/80 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                          Sold Out
                        </div>
                      )}
                    </div>
                    <div class="p-4 px-5 flex-1 flex flex-col">
                      {product.vendor && (
                        <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                          {product.vendor}
                        </span>
                      )}
                      <h3 class="text-[0.95rem] font-semibold mb-1 leading-snug line-clamp-2">
                        {product.title}
                      </h3>
                      <span class="text-base font-bold text-primary mt-auto pt-2">
                        {formatPrice(product.priceRange.minVariantPrice)}
                        {product.priceRange.minVariantPrice.amount !== product.priceRange.maxVariantPrice.amount && (
                          <span class="text-gray-400 dark:text-gray-500 font-normal text-xs ml-1">
                            &ndash; {formatPrice(product.priceRange.maxVariantPrice)}
                          </span>
                        )}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Load More button */}
            {hasNextPage.value && (
              <div class="text-center mt-8">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 py-3 px-8 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                  disabled={loadingMore.value}
                  onClick$={loadMore}
                >
                  {loadingMore.value ? (
                    <>
                      <div class="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Products"
                  )}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile filters drawer */}
      {mobileFiltersOpen.value && (
        <div class="fixed inset-0 z-50 lg:hidden">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick$={() => { mobileFiltersOpen.value = false; }} />
          <div class="absolute right-0 top-0 bottom-0 w-[320px] max-w-[85vw] bg-white dark:bg-[#161616] shadow-2xl flex flex-col animate-slide-in">
            <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                </svg>
                <h2 class="text-sm font-semibold">Filters & Sort</h2>
              </div>
              <button
                type="button"
                class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-dark dark:hover:text-white bg-transparent border-none text-xl"
                onClick$={() => { mobileFiltersOpen.value = false; }}
              >
                &times;
              </button>
            </div>
            <div class="flex-1 overflow-y-auto p-4">
              <FilterContent />
            </div>
            <div class="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                class="w-full py-3 px-4 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                onClick$={() => { mobileFiltersOpen.value = false; }}
              >
                Show {filteredProducts.value.length} products
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const collection = resolveValue(useCollection);
  const heroImg = collection?.image?.url;
  return {
    title: collection
      ? `${collection.title} | The Safety House`
      : "Collection Not Found | The Safety House",
    meta: [
      {
        name: "description",
        content: collection?.description || "Browse our collection",
      },
    ],
    links: heroImg
      ? [{ rel: "preload", as: "image", href: heroImg }]
      : [],
  };
};
