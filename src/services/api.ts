type Role = "empresa" | "superadmin" | "cliente";

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<{ token: string; role: Role }> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { token: "jwt-token-example", role: "empresa" };
    },
    signup: async (data: { email: string; password: string; name: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true, userId: "user-id" };
    },
    logout: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true };
    },
  },

  products: {
    list: async (empresaId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [];
    },
    create: async (data: any) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { id: "new-product-id" };
    },
    update: async (id: string, data: any) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    },
    delete: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    },
  },

  orders: {
    list: async (empresaId: string, params?: any) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [];
    },
    get: async (orderId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return null;
    },
    updateStatus: async (orderId: string, status: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { ok: true };
    },
  },

  clients: {
    list: async (empresaId: string, params?: any) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [];
    },
    create: async (data: any) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { id: "new-client-id" };
    },
    update: async (id: string, data: any) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    },
  },

  checkout: {
    createOrderAndCharge: async (payload: any) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { status: "aprovado", orderId: "12345" };
    },
  },

  companies: {
    list: async (params?: any) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [];
    },
    get: async (companyId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return null;
    },
    create: async (data: any) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { id: "new-company-id" };
    },
    update: async (id: string, data: any) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    },
  },

  subscriptions: {
    list: async (params?: any) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [];
    },
    update: async (id: string, data: any) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    },
  },

  tickets: {
    list: async (params?: any) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [];
    },
    get: async (ticketId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return null;
    },
    create: async (data: any) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { id: "new-ticket-id" };
    },
    update: async (id: string, data: any) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    },
    addMessage: async (ticketId: string, message: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    },
  },
};
