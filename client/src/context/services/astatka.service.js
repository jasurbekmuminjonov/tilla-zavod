import { api } from "./api";

export const astatkaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAstatka: builder.mutation({
      query: (body) => ({
        url: `/astatka/create`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Astatka"],
    }),

    getAstatka: builder.query({
      query: () => ({
        url: "/astatka/get",
        method: "GET",
      }),
      providesTags: ["Astatka"],
    }),
    editAstatka: builder.mutation({
      query: ({ id, body }) => ({
        url: `/astatka/edit/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Astatka"],
    }),
    deleteAstatka: builder.mutation({
      query: (id) => ({
        url: `/astatka/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Astatka"],
    }),
  }),
});

export const {
  useCreateAstatkaMutation,
  useGetAstatkaQuery,
  useDeleteAstatkaMutation,
  useEditAstatkaMutation,
} = astatkaApi;
