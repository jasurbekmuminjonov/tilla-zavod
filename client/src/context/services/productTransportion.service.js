import { api } from "./api";

export const productTransportionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Barcha mahsulot transportatsiyalarini olish
    getProductTransportion: builder.query({
      query: () => ({
        url: "/product-transport",
        method: "GET",
      }),
      providesTags: ["ProductTransportion"],
    }),

    // Yuborilgan mahsulot transportatsiyalari
    getSentProductTransportion: builder.query({
      query: () => ({
        url: "/product-transport/sent",
        method: "GET",
      }),
      providesTags: ["ProductTransportion"],
    }),

    // Qabul qilingan mahsulot transportatsiyalari
    getReceivedProductTransportions: builder.query({
      query: () => ({
        url: "/product-transport/received",
        method: "GET",
      }),
      providesTags: ["ProductTransportion"],
    }),

    // Yangi mahsulot transportatsiyasi yaratish
    createProductTransportion: builder.mutation({
      query: (body) => ({
        url: "/product-transport/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProductTransportion"],
    }),

    // Transportatsiyani yakunlash
    completeProductTransportion: builder.mutation({
      query: (id) => ({
        url: `/product-transport/complete/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["ProductTransportion"],
    }),

    // Transportatsiyani bekor qilish
    cancelProductTransportion: builder.mutation({
      query: (id) => ({
        url: `/product-transport/cancel/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["ProductTransportion"],
    }),
  }),
});

export const {
  useGetProductTransportionQuery,
  useGetSentProductTransportionQuery,
  useGetReceivedProductTransportionsQuery,
  useCreateProductTransportionMutation,
  useCompleteProductTransportionMutation,
  useCancelProductTransportionMutation,
} = productTransportionApi;
