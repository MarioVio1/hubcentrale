import { products as staticProducts } from './products-static';

// Mock db for Vercel free tier (no PostgreSQL/Prisma)
// Uses static product data and returns empty/defaults for user data.

function mockDb() {
  const products = staticProducts.map(p => ({
    ...p,
    id: p.productId,
    skinTypes: p.skinTypes ? JSON.stringify(p.skinTypes) : null,
    skinConcerns: p.skinConcerns ? JSON.stringify(p.skinConcerns) : null,
  }));

  return {
    product: {
      findUnique: async ({ where }: { where: { productId?: string; id?: string } }) => {
        const key = where.productId || where.id;
        return products.find((p: any) => p.productId === key || p.id === key) || null;
      },
      findFirst: async ({ where }: { where: Record<string, any> }) => {
        const conds = where.OR || [where];
        for (const cond of conds) {
          for (const p of products) {
            const match = Object.entries(cond).every(([field, val]) => {
              if (typeof val === 'string' && val.includes) {
                return String((p as any)[field] || '').toLowerCase().includes(val.toLowerCase());
              }
              return (p as any)[field] === val;
            });
            if (match) return p;
          }
        }
        return null;
      },
      findMany: async ({ where, take }: { where?: Record<string, any>; take?: number } = {}) => {
        let results = [...products];
        if (where?.OR) {
          results = results.filter(p =>
            where.OR.some((cond: Record<string, any>) =>
              Object.entries(cond).every(([field, val]) => {
                if (typeof val === 'string' && val.includes) {
                  return String((p as any)[field] || '').toLowerCase().includes(val.toLowerCase());
                }
                return (p as any)[field] === val;
              })
            )
          );
        }
        if (where?.brand) {
          results = results.filter(p =>
            p.brand.toLowerCase().includes(where.brand.toLowerCase())
          );
        }
        if (where?.name) {
          results = results.filter(p =>
            p.name.toLowerCase().includes(where.name.toLowerCase())
          );
        }
        return take ? results.slice(0, take) : results;
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, any> }) => {
        return { ...products.find((p: any) => p.id === where.id), ...data };
      },
      aggregate: async ({ where }: { where?: Record<string, any> }) => {
        const items = where ? products.filter(p => (p as any).productId === where.productId) : products;
        return {
          _avg: { rating: items.reduce((s: number, p: any) => s + p.rating, 0) / (items.length || 1) },
          _count: items.length,
        };
      },
    },
    user: {
      findUnique: async () => null,
      findFirst: async () => null,
      create: async ({ data }: { data: Record<string, any> }) => ({ id: 'mock-user-id', ...data }),
      update: async ({ where, data }: { where: { id: string }; data: Record<string, any> }) => ({
        id: where.id, email: 'mock@example.com', name: 'Mock User', ...data,
        skinType: null, skinConcerns: null, hairType: null, hairConcerns: null,
        age: null, climate: null, country: null,
        password: '',
      }),
    },
    favorite: {
      findMany: async () => [],
      findFirst: async () => null,
      create: async () => ({}),
      deleteMany: async () => ({}),
    },
    review: {
      findMany: async () => [],
      findFirst: async () => null,
      create: async ({ data }: { data: Record<string, any> }) => ({ id: 'mock-review-id', ...data }),
      update: async ({ data }: { data: Record<string, any> }) => data,
      delete: async () => ({}),
      aggregate: async () => ({ _avg: { rating: 0 }, _count: 0 }),
    },
    routine: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async ({ data, include }: { data: Record<string, any>; include?: any }) => ({
        id: 'mock-routine-id',
        ...data,
        items: [],
      }),
      delete: async () => ({}),
    },
  };
}

export const db = mockDb();
