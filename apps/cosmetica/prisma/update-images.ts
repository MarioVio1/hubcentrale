import { db } from "@/lib/db";

async function main() {
  console.log("Updating products with working images...");

  // Working product images from reliable CDNs
  const productUpdates = [
    {
      name: "Advanced Snail 96 Mucin Power Essence",
      // COSRX official image
      imageUrl: "https://cdn11.bigcommerce.com/s-tj3xh/images/stencil/1280x1280/products/1417/4256/COSRX-Snail-Mucin-Essence_2__45473.1708615167.jpg",
    },
    {
      name: "Low pH Good Morning Gel Cleanser",
      imageUrl: "https://cdn11.bigcommerce.com/s-tj3xh/images/stencil/1280x1280/products/984/2969/Good-Morning-Gel-Cleanser__39544.1677524856.jpg",
    },
    {
      name: "Niacinamide 10% + Zinc 1%",
      imageUrl: "https://cdn11.bigcommerce.com/s-tj3xh/images/stencil/1280x1280/products/1617/4839/Niacinamide_2__98641.1712862880.jpg",
    },
    {
      name: "Beauty of Joseon Relief Sun",
      imageUrl: "https://cdn11.bigcommerce.com/s-tj3xh/images/stencil/1280x1280/products/1692/5036/Beauty_of_Joseon_Relief_Sun_Screen__78355.1718186179.jpg",
    },
    {
      name: "Round Lab Dokdo Toner",
      imageUrl: "https://cdn11.bigcommerce.com/s-tj3xh/images/stencil/1280x1280/products/1273/3689/RoundLab-Dokdo-Toner__50889.1697560431.jpg",
    },
    {
      name: "Centella Green Level Buffet Serum",
      imageUrl: "https://cdn11.bigcommerce.com/s-tj3xh/images/stencil/1280x1280/products/1265/3556/Purito-Centella-Green-Level-Buffet-Serum__30307.1696959238.jpg",
    },
    {
      name: "Retinol 0.5 in Squalane",
      imageUrl: "https://cdn11.bigcommerce.com/s-tj3xh/images/stencil/1280x1280/products/1620/4846/Retinol_1__64907.1712863404.jpg",
    },
    {
      name: "Vitamin C 23%",
      imageUrl: "https://cdn11.bigcommerce.com/s-tj3xh/images/stencil/1280x1280/products/1420/4269/Klairs-Vitamin-Drop__36194.1708615549.jpg",
    },
    {
      name: "Cerave Hydrating Cleanser",
      imageUrl: "https://images.ulta.com/is/image/Ulta/2551125?id=4Yt6B4&fmt=webp&qlt=85&w=500&h=500",
    },
    {
      name: "Laneige Water Sleeping Mask",
      imageUrl: "https://images.ulta.com/is/image/Ulta/2541862?id=rZgIYI&fmt=webp&qlt=85&w=500&h=500",
    },
  ];

  for (const update of productUpdates) {
    const result = await db.product.updateMany({
      where: { name: update.name },
      data: { imageUrl: update.imageUrl },
    });
    console.log(`Updated "${update.name}" (${result.count} records)`);
  }

  console.log("All product images updated!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
