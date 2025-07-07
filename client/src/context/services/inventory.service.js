import { api } from "./api";

export const inventoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GOLD: Omborga tilla qo'shish
    createGold: builder.mutation({
      query: ({ warehouse_id, body }) => ({
        url: `/gold/${warehouse_id}/create`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Gold", "Warehouse"],
    }),

    // TOOL: Omborga asbob qo'shish
    createTool: builder.mutation({
      query: ({ warehouse_id, body }) => ({
        url: `/tool/${warehouse_id}/create`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tool", "Warehouse"],
    }),

    // TOOL: Barcha asbob turlarini olish
    getAllToolTypes: builder.query({
      query: () => ({
        url: "/tool/types",
        method: "GET",
      }),
      providesTags: ["Tool"],
    }),
    getGold: builder.query({
      query: () => ({
        url: "/gold",
        method: "GET",
      }),
    }),
    // PRODUCT: Yangi mahsulot qo‘shish
    createProduct: builder.mutation({
      query: (body) => ({
        url: "/product/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useCreateGoldMutation,
  useCreateToolMutation,
  useGetAllToolTypesQuery,
  useCreateProductMutation,
  useGetGoldQuery,
} = inventoryApi;
