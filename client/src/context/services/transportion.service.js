import { api } from "./api";

export const transportionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Barcha transportatsiyalarni olish
    getTransportions: builder.query({
      query: () => ({
        url: "/transport",
        method: "GET",
      }),
      providesTags: ["Transportion"],
    }),

    // Yuborilgan transportatsiyalar
    getSentTransportions: builder.query({
      query: () => ({
        url: "/transport/sent",
        method: "GET",
      }),
      providesTags: ["Transportion"],
    }),

    // Qabul qilingan transportatsiyalar
    getReceivedTransportions: builder.query({
      query: () => ({
        url: "/transport/received",
        method: "GET",
      }),
      providesTags: ["Transportion"],
    }),

    // Yangi transportatsiya yaratish
    createTransportion: builder.mutation({
      query: (body) => ({
        url: "/transport/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Transportion"],
    }),

    // Transportatsiyani yakunlash
    completeTransportion: builder.mutation({
      query: ({ transportion_id, body }) => ({
        url: `/transport/complete/${transportion_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Transportion"],
    }),

    // Transportatsiyani bekor qilish
    cancelTransportion: builder.mutation({
      query: (transportion_id) => ({
        url: `/transport/cancel/${transportion_id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Transportion"],
    }),
  }),
});

export const {
  useGetTransportionsQuery,
  useGetSentTransportionsQuery,
  useGetReceivedTransportionsQuery,
  useCreateTransportionMutation,
  useCompleteTransportionMutation,
  useCancelTransportionMutation,
} = transportionApi;
