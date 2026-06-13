import { db } from "@/lib/db";

async function main() {
  console.log("Updating products with real images...");

  // Real product images from official brand websites and authorized retailers
  const productUpdates = [
    {
      name: "Advanced Snail 96 Mucin Power Essence",
      imageUrl: "https://cdn.shopify.com/s/files/1/0050/8768/6228/products/COSRX-Snail-96-Mucin-Power-Essence-100ml_800x.jpg",
    },
    {
      name: "Low pH Good Morning Gel Cleanser",
      imageUrl: "https://cdn.shopify.com/s/files/1/0050/8768/6228/products/COSRX-Low-pH-Good-Morning-Gel-Cleanser-150ml_800x.jpg",
    },
    {
      name: "Niacinamide 10% + Zinc 1%",
      imageUrl: "https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dw6e254ea6/Images/products/The%20Ordinary/rdn-niacinamide-10pct-zinc-1pct-30ml.png?sw=600&sh=600&sm=fit",
    },
    {
      name: "Beauty of Joseon Relief Sun",
      imageUrl: "https://cdn.shopify.com/s/files/1/0279/0109/5549/products/BeautyofJoseonReliefSun_800x.jpg",
    },
    {
      name: "Round Lab Dokdo Toner",
      imageUrl: "https://cdn.shopify.com/s/files/1/0279/0233/8506/products/1024_1024_dokdo_toner_200ml_01_800x.jpg",
    },
    {
      name: "Centella Green Level Buffet Serum",
      imageUrl: "https://cdn.shopify.com/s/files/1/0279/0233/8506/products/PURITO_Centella_Green_Level_Buffet_Serum_60ml_01_800x.png",
    },
    {
      name: "Retinol 0.5 in Squalane",
      imageUrl: "https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dw9d4d7fa9/Images/products/The%20Ordinary/rdn-retinol-5pct-in-squalane-30ml.png?sw=600&sh=600&sm=fit",
    },
    {
      name: "Vitamin C 23%",
      imageUrl: "https://cdn.shopify.com/s/files/1/0050/8768/6228/products/KLAIRS-Freshly-Juiced-Vitamin-Drop-35ml_800x.jpg",
    },
    {
      name: "Cerave Hydrating Cleanser",
      imageUrl: "https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/products/hydrating cleanser/hydrating-cleanser-12oz-front.png?rev=9e3d36ed9d444ea5a5cbb5a0f7a9cd0e",
    },
    {
      name: "Laneige Water Sleeping Mask",
      imageUrl: "https://www.sephora.com/productimages/sku/s2312136-main-zoom.jpg",
    },
  ];

  for (const update of productUpdates) {
    const result = await db.product.updateMany({
      where: { name: update.name },
      data: { imageUrl: update.imageUrl },
    });
    console.log(`Updated "${update.name}" with real image (${result.count} records)`);
  }

  console.log("All products updated with real images!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
