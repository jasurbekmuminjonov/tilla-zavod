import { api } from "./api";

export const processApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Jarayonlarni olish
    getProcesses: builder.query({
      query: () => ({
        url: "/process",
        method: "GET",
      }),
      providesTags: ["Process"],
    }),
    getProcessesByUser: builder.query({
      query: () => ({
        url: "/process/user",
        method: "GET",
      }),
      providesTags: ["Process"],
    }),

    // Yangi jarayon yaratish
    createProcess: builder.mutation({
      query: (body) => ({
        url: "/process/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Process"],
    }),

    // Jarayonni boshlash
    startProcess: builder.mutation({
      query: (process_id) => ({
        url: `/process/start/${process_id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Process"],
    }),

    // Jarayonni yakunlash
    endProcess: builder.mutation({
      query: ({ process_id, body }) => ({
        url: `/process/end/${process_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Process", "Losses"],
    }),

    // Jarayonni bekor qilish
    cancelProcess: builder.mutation({
      query: (process_id) => ({
        url: `/process/cancel/${process_id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Process"],
    }),
    getLossesSummary: builder.query({
      query: (user_id) => ({
        url: `/process/lost/summary?user_id=${user_id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetProcessesQuery,
  useCreateProcessMutation,
  useStartProcessMutation,
  useEndProcessMutation,
  useCancelProcessMutation,
  useGetProcessesByUserQuery,
  useLazyGetLossesSummaryQuery,
} = processApi;
