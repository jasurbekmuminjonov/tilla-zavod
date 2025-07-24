import { api } from "./api";

export const inventoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GOLD: Omborga tilla qo'shish
    createGold: builder.mutation({
      query: (body) => ({
        url: `/gold/create`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Gold"],
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
    searchGold: builder.query({
      query: (goldId) => ({
        url: `/gold/search/${goldId}`,
        method: "GET",
      }),
      providesTags: ["Gold"],
    }),
    getGold: builder.query({
      query: () => ({
        url: "/gold",
        method: "GET",
      }),
      providesTags: ["Gold"],
    }),
    getProduct: builder.query({
      query: () => ({
        url: "/product",
        method: "GET",
      }),
      providesTags: ["Product"],
    }),
    getLosses: builder.query({
      query: () => ({
        url: "/losses",
        method: "GET",
      }),
      providesTags: ["Losses"],
    }),
    // PRODUCT: Yangi mahsulot qo‘shish
    createProduct: builder.mutation({
      query: (body) => ({
        url: "/product/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product", "User", "Warehouse", "Losses"],
    }),
  }),
});

export const {
  useCreateGoldMutation,
  useCreateToolMutation,
  useGetAllToolTypesQuery,
  useCreateProductMutation,
  useGetGoldQuery,
  useGetProductQuery,
  useLazySearchGoldQuery,
  useGetLossesQuery,
} = inventoryApi;
