import { api } from "./api";

export const toolTransportionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getToolTransportion: builder.query({
      query: () => ({
        url: "/tool-transport",
        method: "GET",
      }),
      providesTags: ["ToolTransportion"],
    }),

    createToolTransportion: builder.mutation({
      query: (body) => ({
        url: "/tool-transport/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ToolTransportion", "Tool"],
    }),
  }),
});

export const {
  useGetToolTransportionQuery,
  useCreateToolTransportionMutation,
} = toolTransportionApi;
