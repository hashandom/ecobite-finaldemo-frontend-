export const API = {
  AUTH: {
    LOGIN: '/auth/login',          // POST
    LOGOUT: '/auth/logout',         // POST
    REGISTER: '/auth/register',      // POST
    CHANGE_PASSWORD: '/auth/change-password', // PUT
    FORGOT_PASSWORD: '/auth/forgot-password', // POST
    RESET_PASSWORD: '/auth/reset-password',   // POST
    UNLOCK: (username: string) => `/auth/unlock/${username}`, // PUT
    PROFILE: '/auth/me',             // GET (assumed)
  },
  PRODUCTS: {
    BASE: '/products',            // GET (list), POST (create)
    BY_ID: (id: string | number) => `/products/${id}`,   // GET, PUT, DELETE
    LOW_STOCK: '/products/low-stock', // GET
    LOW_STOCK_COUNT: '/products/low-stock/count', // GET
    UPDATE_STOCK: (id: string | number) => `/products/update-stock/${id}`, // PUT (query ?stock=N)
    SEARCH: '/products/search',      // GET (query ?name=X)
    BY_CATEGORY: (cat: string) => `/products/category/${cat}`, // GET
  },
  BATCHES: {
    BASE: '/batches',
    BY_ID: (id: string | number) => `/batches/${id}`,
    BY_PRODUCT: (productId: string) => `/batches/product/${productId}`, // GET
    ALLOCATE: '/batches/allocate',   // POST
    REDUCE: (id: string | number) => `/batches/reduce/${id}`, // POST
    SPOIL: (id: string | number) => `/batches/${id}/spoil`, // PUT
    RECALL: (id: string | number) => `/batches/${id}/recall`, // PUT
    EXPIRING_SOON: '/batches/expiring-soon', // GET (query ?days=N)
    COUNT: '/batches/count',         // GET
    EXPIRING_COUNT: '/batches/expiring/count', // GET
  },
  INVENTORY: {
    BASE: '/inventory',
    ADJUST: '/inventory/adjust',
  },
  DASHBOARD: {
    OVERVIEW: '/dashboard/overview', // GET
  },
  SUPPLIERS: {
    BASE: '/suppliers',
    BY_ID: (id: string | number) => `/suppliers/${id}`, // GET, PUT, DELETE
    COUNT: '/suppliers/count', // GET
    RATING: (id: string | number) => `/suppliers/${id}/rating`, // PUT
    ASSIGN_PRODUCT: '/suppliers/assign-product', // POST
    PRODUCTS: (id: string | number) => `http://localhost:8080/suppliers/${id}/products`, // GET
    BEST: (productId: string) => `/suppliers/best/${productId}`, // GET
  },
  LOCATIONS: {
    BASE: '/location', // GET, POST
    BY_ID: (id: string | number) => `/location/${id}`, // GET
    WAREHOUSE_COUNT: '/location/warehouses/count', // GET
    ASSIGN: '/location/assign', // POST
    MOVE: '/location/move', // POST
    INVENTORY: (id: string | number) => `/location/${id}/inventory`, // GET
    BY_BATCH: (batchId: string | number) => `/location/batch/${batchId}`, // GET
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    COUNT: '/notifications/count',
    BY_ROLE: (role: string) => `/notifications/role/${role}`,
    UNREAD_COUNT: (role: string) => `/notifications/unread/count/${role}`,
    ROLE_COUNT: (role: string) => `/notifications/count/${role}`,
    MARK_AS_READ: (id: string | number) => `/notifications/${id}/read`,
  },
  REORDERS: {
    BASE: '/reorders', // GET (list all), POST (create)
    BY_ID: (id: string | number) => `/reorders/${id}`, // GET, DELETE
    STATUS: (id: string | number) => `/reorders/${id}/status`, // PUT (body: { status: 'PENDING'|'APPROVED'|'REJECTED'|'FULFILLED' })
    PENDING_COUNT: '/reorders/pending/count', // GET
    LOW_STOCK_SUPPLIERS: '/reorders/low-stock-suppliers', // GET
  },
  ANALYTICS: {
    MONTHLY: '/analytics/monthly', // GET
  },
  ALERTS: {
    BASE: '/alerts',
    RESOLVE: (id: string | number) => `/alerts/${id}/resolve`
  },
  USERS: {
    BASE: '/auth/users',
    STAFF: '/auth/users',
    CUSTOMERS: '/users/customers',
    BY_ID: (id: string | number) => `/auth/users/${id}`,
  },
  ROLES: {
    BASE: '/roles',
    BY_ID: (id: string | number) => `/roles/${id}`,
  },
  QR: {
    BASE: '/qr',
    GENERATE: '/qr/generate',
    SCAN: (qrCodeId: string) => `/qr/scan/${qrCodeId}`,
    IMAGE: (qrCodeId: string) => `http://localhost:8086/qr/image/${qrCodeId}`,
    BY_BATCH: (batchId: string | number) => `/qr/batch/${batchId}`,
  }
};
