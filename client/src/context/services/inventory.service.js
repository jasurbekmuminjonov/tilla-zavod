import { api } from "./api";

export const inventoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createGold: builder.mutation({
      query: (body) => ({
        url: `/gold/create`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Gold"],
    }),
    deleteGold: builder.mutation({
      query: (id) => ({
        url: `/gold/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Gold"],
    }),
    deleteTool: builder.mutation({
      query: (id) => ({
        url: `/tool/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tool"],
    }),
    editTool: builder.mutation({
      query: ({ id, body }) => ({
        url: `/tool/update/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Tool"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/product/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
    editProduct: builder.mutation({
      query: ({ id, body }) => ({
        url: `/product/edit/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Product"],
    }),

    createTool: builder.mutation({
      query: (body) => ({
        url: `/tool/create`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tool"],
    }),

    getTools: builder.query({
      query: () => ({
        url: "/tool",
        method: "GET",
      }),
      providesTags: ["Tool"],
    }),
    getToolCreatings: builder.query({
      query: () => ({
        url: "/tool/creatings",
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
  useGetToolsQuery,
  useCreateProductMutation,
  useGetGoldQuery,
  useGetProductQuery,
  useLazySearchGoldQuery,
  useGetLossesQuery,
  useGetToolCreatingsQuery,
  useDeleteGoldMutation,
  useDeleteToolMutation,
  useEditToolMutation,
  useDeleteProductMutation,
  useEditProductMutation,
} = inventoryApi;
