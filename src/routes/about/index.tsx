import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      <div class="bg-gradient-to-br from-dark to-[#2d2d2d] text-white py-14 px-8 text-center">
        <h1 class="text-4xl font-extrabold tracking-tight mb-2">About Us</h1>
        <p class="text-white/60 text-base">
          We strive to keep it simple. Focusing on the best quality CSA footwear
          and clothing in the market.
        </p>
      </div>

      <div class="max-w-[800px] mx-auto py-12 px-8">
        <h2 class="text-xl font-bold mb-3 text-dark">The Safety House</h2>
        <p class="text-gray-500 mb-4 leading-loose text-[0.925rem]">
          The Safety House focuses on offering key products on time by employing
          the latest technologies, selecting reliable suppliers, and maintaining
          personable staff to address customer needs. We are your one stop shop
          for quality specialized clothing, safety footwear, and in-house
          embroidery services.
        </p>

        <h2 class="text-xl font-bold mb-3 mt-8 text-dark">
          What We Do For You
        </h2>
        <p class="text-gray-500 mb-4 leading-loose text-[0.925rem]">
          The Safety House specializes in apparel supply and embroidery for
          construction workwear, medical apparel, school team sports wear, and
          promotional products. We offer quality footwear, protective clothing,
          and safety attire with personalization services all in one location.
        </p>

        <h2 class="text-xl font-bold mb-3 mt-8 text-dark">The Experts</h2>
        <p class="text-gray-500 mb-4 leading-loose text-[0.925rem]">
          Our management team brings years of successful apparel market
          experience. We emphasize superior design, sourcing, integrated
          promotion, and focused customer support with the highest integrity in
          the market.
        </p>

        <h2 class="text-xl font-bold mb-3 mt-8 text-dark">Our Promise</h2>
        <p class="text-gray-500 mb-4 leading-loose text-[0.925rem]">
          We are committed to delivering products that meet customer needs
          through quality, unquestionable reliability, and superior customer
          service. We listen to our customers and anticipate their needs to
          ensure every experience with The Safety House exceeds expectations.
        </p>

        <h2 class="text-xl font-bold mb-3 mt-8 text-dark">Our Customers</h2>
        <p class="text-gray-500 mb-4 leading-loose text-[0.925rem]">
          The Safety House maintains long-term relationships built on respect and
          fairness. We serve customers throughout Eastern Ontario via repeat
          business and referrals, and we're proud of the community we've built
          over the years.
        </p>
      </div>
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
