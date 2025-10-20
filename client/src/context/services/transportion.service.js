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
    getExternalTransportions: builder.query({
      query: () => ({
        url: "/external-transport/get",
        method: "GET",
      }),
      providesTags: ["ExtTransportion"],
    }),
    getTransportionsReport: builder.query({
      query: ({ first_user, second_user }) => ({
        url: `/transport/report?first_user=${first_user}&second_user=${second_user}`,
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
    createExtTransportion: builder.mutation({
      query: (body) => ({
        url: "/external-transport/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ExtTransportion"],
    }),

    deleteExtTransportion: builder.mutation({
      query: (transportion_id) => ({
        url: `/external-transport/delete/${transportion_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ExtTransportion"],
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

    // Transportatsiyani qaytarib olish
    returnTransportion: builder.mutation({
      query: ({ transportion_id, body }) => ({
        url: `/transport/return/${transportion_id}`,
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
    getSummaryGived: builder.query({
      query: (user_id) => ({
        url: `/transport/summary/gived?user_id=${user_id}`,
        method: "GET",
      }),
      providesTags: ["Transportion"],
    }),

    getSummaryGet: builder.query({
      query: (user_id) => ({
        url: `/transport/summary/get?user_id=${user_id}`,
        method: "GET",
      }),
      providesTags: ["Transportion"],
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
  useReturnTransportionMutation,
  useLazyGetTransportionsReportQuery,
  useLazyGetSummaryGetQuery,
  useLazyGetSummaryGivedQuery,
  useCreateExtTransportionMutation,
  useGetExternalTransportionsQuery,
  useDeleteExtTransportionMutation
} = transportionApi;
