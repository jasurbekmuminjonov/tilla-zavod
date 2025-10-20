import { api } from "./api";

export const providerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Barcha yetkazib beruvchilarni olish
    getProviders: builder.query({
      query: () => ({
        url: "/provider",
        method: "GET",
      }),
      providesTags: ["Provider"],
    }),

    // Yangi yetkazib beruvchi yaratish
    createProvider: builder.mutation({
      query: (body) => ({
        url: "/provider/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Provider"],
    }),
    deleteProvider: builder.mutation({
      query: (id) => ({
        url: `/provider/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Provider"],
    }),
    editProvider: builder.mutation({
      query: ({ id, body }) => ({
        url: `/provider/edit/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Provider"],
    }),
  }),
});

export const {
  useGetProvidersQuery,
  useCreateProviderMutation,
  useDeleteProviderMutation,
  useEditProviderMutation,
} = providerApi;
