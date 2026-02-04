// rt.get("/tool2/all", tool2.getAll);
// rt.post("/tool2/create", tool2.create);
// rt.put("/tool2/update/:id", tool2.update);
// rt.delete("/tool2/delete/:id", tool2.delete);

import { api } from "./api";

export const tool2Api = api.injectEndpoints({
  endpoints: (builder) => ({
    getAll: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return {
          url: `/tool2/all${queryString ? "?" + queryString : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Tool2", "ToolDistribution"],
    }),
    getFroms: builder.query({
      query: () => ({
        url: "/tool2/froms",
        method: "GET",
      }),
      providesTags: ["Tool2", "ToolDistribution"],
    }),
    create: builder.mutation({
      query: (body) => ({
        url: "/tool2/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tool2", "ToolDistribution"],
    }),
    update: builder.mutation({
      query: ({ id, body }) => ({
        url: `/tool2/update/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Tool2", "ToolDistribution"],
    }),
    delete: builder.mutation({
      query: (id) => ({
        url: `/tool2/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tool2", "ToolDistribution"],
    }),
  }),
});

export const {
  useGetAllQuery,
  useGetFromsQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = tool2Api;
