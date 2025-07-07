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
  }),
});

export const {
  useGetProvidersQuery,
  useCreateProviderMutation,
} = providerApi;
