import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import {
  getProductByHandle,
  formatPrice,
  createCart,
  addToCart,
} from "~/lib/shopify";
import type { ShopifyVariant } from "~/lib/shopify";

export const useProduct = routeLoader$(async (requestEvent) => {
  const handle = requestEvent.params.handle;
  const product = await getProductByHandle(handle);

  if (!product) {
    requestEvent.status(404);
    return null;
  }

  return product;
});

export default component$(() => {
  const product = useProduct();
  const selectedImage = useSignal(0);
  const selectedVariantId = useSignal("");
  const adding = useSignal(false);
  const added = useSignal(false);
  const cartCount = useSignal(0);

  // Load cart count from localStorage on mount
  useVisibleTask$(() => {
    const count = localStorage.getItem("cart_count");
    if (count) cartCount.value = parseInt(count, 10);
  });

  // Set default selected variant
  useVisibleTask$(({ track }) => {
    track(() => product.value);
    if (product.value) {
      const variants = product.value.variants.edges.map((e) => e.node);
      const available = variants.find((v) => v.availableForSale);
      if (available) {
        selectedVariantId.value = available.id;
      }
    }
  });

  const handleAddToCart = $(async () => {
    if (!selectedVariantId.value || adding.value) return;

    adding.value = true;
    added.value = false;

    try {
      const cartId = localStorage.getItem("cart_id");

      let cart;
      if (cartId) {
        cart = await addToCart(cartId, selectedVariantId.value, 1);
      } else {
        cart = await createCart(selectedVariantId.value, 1);
      }

      localStorage.setItem("cart_id", cart.id);
      localStorage.setItem("cart_checkout_url", cart.checkoutUrl);
      localStorage.setItem("cart_count", String(cart.totalQuantity));
      cartCount.value = cart.totalQuantity;
      added.value = true;

      setTimeout(() => (added.value = false), 2500);
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      adding.value = false;
    }
  });

  if (!product.value) {
    return (
      <div
        class="section"
        style={{ textAlign: "center", padding: "6rem 2rem" }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            marginBottom: "1rem",
          }}
        >
          Product not found
        </h1>
        <Link href="/" class="btn btn-primary">
          Back to Shop
        </Link>
      </div>
    );
  }

  const p = product.value;
  const images = p.images.edges.map((e) => e.node);
  const variants = p.variants.edges.map((e) => e.node);
  const anyAvailable = variants.some((v) => v.availableForSale);

  const getStockLabel = (variant: ShopifyVariant) => {
    return variant.availableForSale ? "In stock" : "Out of stock";
  };

  const getStockColor = (variant: ShopifyVariant) => {
    return variant.availableForSale ? "#16a34a" : "#dc2626";
  };

  // Find the currently selected variant for stock display
  const activeVariant = variants.find((v) => v.id === selectedVariantId.value);

  return (
    <div class="section">
      <Link href="/" class="back-link">
        &larr; Back to products
      </Link>

      <div class="product-detail">
        {/* Images */}
        <div>
          {images.length > 0 ? (
            <>
              <img
                src={images[selectedImage.value]?.url}
                alt={images[selectedImage.value]?.altText || p.title}
                class="product-detail-img"
              />
              {images.length > 1 && (
                <div class="product-thumbnails">
                  {images.map((img, i) => (
                    <button
                      key={img.url}
                      onClick$={() => (selectedImage.value = i)}
                      class={`product-thumb ${i === selectedImage.value ? "active" : ""}`}
                    >
                      <img
                        src={img.url}
                        alt={img.altText || `${p.title} ${i + 1}`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div
              class="no-image"
              style={{
                aspectRatio: "1",
                height: "auto",
                borderRadius: "var(--radius-lg)",
              }}
            >
              No image
            </div>
          )}
        </div>

        {/* Product Info */}
        <div class="product-info">
          <h1>{p.title}</h1>

          <p class="product-price">
            {formatPrice(p.priceRange.minVariantPrice)}
            {p.priceRange.minVariantPrice.amount !==
              p.priceRange.maxVariantPrice.amount && (
              <span class="price-range">
                {" "}
                &ndash; {formatPrice(p.priceRange.maxVariantPrice)}
              </span>
            )}
          </p>

          {/* Availability Indicator */}
          {activeVariant && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: getStockColor(activeVariant),
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: getStockColor(activeVariant),
                }}
              >
                {getStockLabel(activeVariant)}
              </span>
            </div>
          )}

          {/* Variant Selector */}
          {variants.length > 1 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <p class="variant-label">Select Option</p>
              <div class="variant-list">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick$={() => {
                      if (v.availableForSale) selectedVariantId.value = v.id;
                    }}
                    class={`variant-chip ${!v.availableForSale ? "unavailable" : ""} ${
                      v.id === selectedVariantId.value ? "selected" : ""
                    }`}
                    disabled={!v.availableForSale}
                  >
                    {v.title} &middot; {formatPrice(v.price)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.5rem" }}>
            <button
              class={`btn ${anyAvailable ? "btn-primary" : "btn-disabled"} add-to-cart-btn`}
              onClick$={handleAddToCart}
              disabled={!anyAvailable || adding.value}
            >
              {adding.value
                ? "Adding..."
                : added.value
                  ? "Added to Cart!"
                  : anyAvailable
                    ? "Add to Cart"
                    : "Sold Out"}
            </button>

            {cartCount.value > 0 && (
              <a
                href={typeof window !== "undefined" ? localStorage.getItem("cart_checkout_url") || "#" : "#"}
                class="btn btn-dark"
                target="_blank"
                rel="noopener noreferrer"
              >
                Checkout ({cartCount.value})
              </a>
            )}
          </div>

          {/* Description */}
          {p.descriptionHtml && (
            <div
              class="product-description"
              dangerouslySetInnerHTML={p.descriptionHtml}
            />
          )}
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const product = resolveValue(useProduct);
  return {
    title: product
      ? `${product.title} | The Safety House`
      : "Product Not Found | The Safety House",
    meta: [
      {
        name: "description",
        content: product?.description || "Product page",
      },
    ],
  };
};
