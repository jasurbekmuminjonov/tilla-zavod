import { api } from "./api";

export const factoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createFactory: builder.mutation({
      query: (body) => ({
        url: "/factory/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Factory", "Order"]
    }),
    getFactory: builder.query({
      query: () => ({
        url: "/factory",
        method: "GET",
      }),
      providesTags: ["Factory"],
    }),
    // depositToFactory: builder.mutation({
    //   query: ({ factory_id, body }) => ({
    //     url: `/factory/deposit/${factory_id}`,
    //     method: "POST",
    //     body,
    //   }),
    //   invalidatesTags: ["Factory", "Order"]
    // }),
  }),
});

export const {
  useCreateFactoryMutation,
  useGetFactoryQuery,
  // useDepositToFactoryMutation,
} = factoryApi;
