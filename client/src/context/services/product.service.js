    // import { api } from "./api";

    // export const productApi = api.injectEndpoints({
    //   endpoints: (builder) => ({
    //     createProduct: builder.mutation({
    //       query: (body) => ({
    //         url: "/product/create",
    //         method: "POST",
    //         body,
    //       }),
    //       invalidatesTags: ["Product", "Delivery", "Warehouse"]
    //     }),
    //     getProducts: builder.query({
    //       query: () => ({
    //         url: "/product/get",
    //         method: "GET",
    //       }),
    //       providesTags: ["Product", "Delivery", "Warehouse"],
    //     }),
    //     editProduct: builder.mutation({
    //       query: ({ id, body }) => ({
    //         url: `/product/edit/${id}`,
    //         method: "PUT",
    //         body,
    //       }),
    //       invalidatesTags: ["Product", "Delivery", "Warehouse"]
    //     }),
    //   }),
    // });

    // export const {
    //   useCreateProductMutation,
    //   useGetProductsQuery,
    //   useEditProductMutation,
    // } = productApi;
