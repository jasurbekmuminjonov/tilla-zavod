import { api } from "./api";

export const toolDistributionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createDistribution: builder.mutation({
      query: (body) => ({
        url: "/tool-distribution/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ToolDistribution", "Tool2"],
    }),

    getDistributions: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return {
          url: `/tool-distribution/all${qs ? "?" + qs : ""}`,
          method: "GET",
        };
      },
      providesTags: ["ToolDistribution", "Tool2"],
    }),

    getDistributionMeta: builder.query({
      query: () => ({
        url: "/tool-distribution/meta",
        method: "GET",
      }),
      providesTags: ["ToolDistribution"],
    }),

    getDistributionById: builder.query({
      query: (id) => ({
        url: `/tool-distribution/${id}`,
        method: "GET",
      }),
      providesTags: ["ToolDistribution", "Tool2"],
    }),

    updateDistribution: builder.mutation({
      query: ({ id, body }) => ({
        url: `/tool-distribution/edit/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ToolDistribution", "Tool2"],
    }),

    deleteDistribution: builder.mutation({
      query: (id) => ({
        url: `/tool-distribution/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ToolDistribution", "Tool2"],
    }),
  }),
});

export const {
  useCreateDistributionMutation,
  useGetDistributionsQuery,
  useGetDistributionMetaQuery,
  useGetDistributionByIdQuery,
  useUpdateDistributionMutation,
  useDeleteDistributionMutation,
} = toolDistributionApi;
