import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  const faqs = [
    {
      q: "Where is The Safety House located?",
      a: "Our store is located at 595 West Hunt Club Road in Nepean, Ontario (K2G 5X6). We're easy to find and offer ample parking for our customers.",
    },
    {
      q: "What are the store hours?",
      a: "Monday to Wednesday: 8:30 AM - 6:00 PM, Thursday: 8:30 AM - 7:00 PM, Friday: 8:30 AM - 6:00 PM, Saturday: 9:00 AM - 4:00 PM, Sunday: Closed. December Sundays: 10:00 AM - 4:00 PM. We are closed on long weekends.",
    },
    {
      q: "Which safety footwear brands do you carry?",
      a: "We carry a wide selection of CSA-approved footwear including Vismo, Timberland Pro, Red Wing, Blundstone, Canada West, Redback, Muck, Royer, Dunlap, Baffin, Terra, Keen, and Swat.",
    },
    {
      q: "What workwear brands are available?",
      a: "Our workwear selection includes Carhartt, Blakl\u00e4der, Tough Duck, Gatts, Red Cap, Orange, Oberon, Pioneer, Viking, Canada Sportswear (CX2), Stormtech, Big Bill, and Dickies.",
    },
    {
      q: "Do you carry sportswear and casual apparel?",
      a: "Yes! We stock Stormtech, Trimark, Gildan, Nike, Adidas, Puma, Champion, Roots, Eddie Bauer, Spyder, and many more brands for both sportswear and casual apparel.",
    },
    {
      q: "What headwear brands do you offer?",
      a: "We carry New Era, Flexfit, Yupoong, OGIO, Cap America, and Calloway headwear.",
    },
    {
      q: "Do you offer embroidery and customization services?",
      a: "Yes! We offer in-house embroidery and transfer services. Our Decoration Done Right service provides timely, budget-conscious personalization for companies, schools, teams, and organizations.",
    },
    {
      q: "How can I contact The Safety House?",
      a: "You can reach us by phone at 613-224-6804 or by email at info@safetyhouse.ca. You're also welcome to visit us at our store on West Hunt Club Road.",
    },
  ];

  return (
    <>
      <div class="page-header">
        <h1>Frequently Asked Questions</h1>
        <p>Everything you need to know about The Safety House.</p>
      </div>

      <div class="page-content">
        {faqs.map((faq) => (
          <div key={faq.q} class="faq-item">
            <h3>{faq.q}</h3>
            <p>{faq.a}</p>
          </div>
        ))}
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "FAQ | The Safety House",
  meta: [
    {
      name: "description",
      content:
        "Frequently asked questions about The Safety House - location, hours, brands, embroidery services, and more.",
    },
  ],
};
