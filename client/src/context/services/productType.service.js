import { api } from "./api";

export const productTypeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Barcha mahsulot turlarini olish
    getProductTypes: builder.query({
      query: () => ({
        url: "/product-type",
        method: "GET",
      }),
      providesTags: ["ProductType"],
    }),

    // Yangi mahsulot turi yaratish
    createProductType: builder.mutation({
      query: (body) => ({
        url: "/product-type/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProductType"],
    }),

    // Mahsulot turini tahrirlash
    editProductType: builder.mutation({
      query: ({ id, body }) => ({
        url: `/product-type/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ProductType"],
    }),

    // Mahsulot turini o'chirish
    deleteProductType: builder.mutation({
      query: (id) => ({
        url: `/product-type/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductType"],
    }),
  }),
});

export const {
  useGetProductTypesQuery,
  useCreateProductTypeMutation,
  useEditProductTypeMutation,
  useDeleteProductTypeMutation,
} = productTypeApi;
