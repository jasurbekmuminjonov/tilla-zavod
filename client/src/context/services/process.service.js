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
      invalidatesTags: ["Process", "Gold", "User"],
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
      invalidatesTags: ["Process", "Gold", "User", "Losses"],
    }),

    // Jarayonni bekor qilish
    cancelProcess: builder.mutation({
      query: (process_id) => ({
        url: `/process/cancel/${process_id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Process", "Gold", "User"],
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
} = processApi;
