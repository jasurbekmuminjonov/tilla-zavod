import { api } from "./api";

export const toolTransportionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Barcha asbob transportatsiyalarini olish
    getToolTransportion: builder.query({
      query: () => ({
        url: "/tool-transport",
        method: "GET",
      }),
      providesTags: ["ToolTransportion"],
    }),

    // Yuborilgan transportatsiyalar
    getSentToolTransportion: builder.query({
      query: () => ({
        url: "/tool-transport/sent",
        method: "GET",
      }),
      providesTags: ["ToolTransportion"],
    }),

    // Qabul qilingan transportatsiyalar
    getReceivedToolTransportion: builder.query({
      query: () => ({
        url: "/tool-transport/received",
        method: "GET",
      }),
      providesTags: ["ToolTransportion"],
    }),

    // Yangi transportatsiya yaratish
    createToolTransportion: builder.mutation({
      query: (body) => ({
        url: "/tool-transport/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ToolTransportion"],
    }),

    // Transportatsiyani yakunlash
    completeToolTransportion: builder.mutation({
      query: (id) => ({
        url: `/tool-transport/complete/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["ToolTransportion"],
    }),

    // Transportatsiyani bekor qilish
    cancelToolTransportion: builder.mutation({
      query: (id) => ({
        url: `/tool-transport/cancel/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["ToolTransportion"],
    }),
  }),
});

export const {
  useGetToolTransportionQuery,
  useGetSentToolTransportionQuery,
  useGetReceivedToolTransportionQuery,
  useCreateToolTransportionMutation,
  useCompleteToolTransportionMutation,
  useCancelToolTransportionMutation,
} = toolTransportionApi;
