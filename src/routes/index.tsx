import { component$ } from "@builder.io/qwik";
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
      bg: "linear-gradient(135deg, #1b2838 0%, #2c3e50 100%)",
    },
    {
      name: "Safety Footwear",
      handle: "safety-footwear",
      desc: "CSA-approved boots and shoes",
      bg: "linear-gradient(135deg, #2d1b00 0%, #5a3a1a 100%)",
    },
    {
      name: "Flame Resistant",
      handle: "flame-resistant",
      desc: "Specialized protective garments",
      bg: "linear-gradient(135deg, #4a1a1a 0%, #7a2e2e 100%)",
    },
    {
      name: "School Wear",
      handle: "school-wear",
      desc: "Sports and institutional apparel",
      bg: "linear-gradient(135deg, #1a2a1a 0%, #2e5a3a 100%)",
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

  return (
    <>
      {/* Hero */}
      <section class="hero">
        <div class="hero-inner">
          <div class="hero-badge">Eastern Ontario's Safety Experts</div>
          <h1>
            Where Work &amp; Lifestyle
            <br />
            Apparel <em>Intersect</em>
          </h1>
          <p>
            The Safety House is your one stop shop for quality specialized
            clothing, CSA safety footwear, and in-house embroidery services.
          </p>
          <div class="hero-actions">
            <Link href="/#products" class="btn btn-primary">
              Shop Products
            </Link>
            <Link href="/about/" class="btn btn-outline">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section class="section">
        <div class="section-header">
          <h2>Shop by Category</h2>
          <p>
            From the job site to the classroom, we've got you covered.
          </p>
        </div>
        <div class="category-grid">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/collections/${cat.handle}/`}
              class="category-card"
              style={{ background: cat.bg }}
            >
              <div>
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
              </div>
              <span class="card-arrow">&rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Brands */}
      <div class="brands-banner">
        <h2>Trusted Brands We Carry</h2>
        <div class="brands-list">
          {brands.map((brand) => (
            <span key={brand} class="brand-tag">
              {brand}
            </span>
          ))}
        </div>
      </div>

      {/* Products */}
      <section class="section" id="products">
        <div class="section-header">
          <h2>Our Products</h2>
          <p>Quality workwear, safety gear, and more.</p>
        </div>

        {products.value.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
            No products found.
          </p>
        ) : (
          <div class="product-grid">
            {products.value.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.handle}/`}
                class="product-card"
              >
                {product.featuredImage ? (
                  <img
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                    width={400}
                    height={400}
                    class="product-card-img"
                  />
                ) : (
                  <div class="no-image">No image</div>
                )}
                <div class="product-card-body">
                  <h3>{product.title}</h3>
                  <span class="price">
                    {formatPrice(product.priceRange.minVariantPrice)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Decoration / Services Teaser */}
      <section class="section">
        <div class="section-header">
          <h2>Why The Safety House?</h2>
          <p>Decades of experience serving Eastern Ontario.</p>
        </div>
        <div class="info-grid">
          <div class="info-card">
            <div class="icon">&#9874;</div>
            <h3>Quality CSA Gear</h3>
            <p>
              We focus on the best quality CSA footwear and clothing on the
              market from brands like Timberland Pro, Red Wing, Blundstone, and
              more.
            </p>
          </div>
          <div class="info-card">
            <div class="icon">&#9997;</div>
            <h3>Decoration Done Right</h3>
            <p>
              In-house embroidery and transfer services. Timely, budget-conscious
              personalization for your team, school, or company.
            </p>
          </div>
          <div class="info-card">
            <div class="icon">&#9734;</div>
            <h3>Expert Service</h3>
            <p>
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
