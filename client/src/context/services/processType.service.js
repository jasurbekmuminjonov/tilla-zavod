import { api } from "./api";

export const processTypeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Barcha jarayon turlarini olish
    getProcessTypes: builder.query({
      query: () => ({
        url: "/process-type",
        method: "GET",
      }),
      providesTags: ["ProcessType"],
    }),

    // Foydalanuvchiga tegishli jarayon turlarini olish
    getProcessTypesByUser: builder.query({
      query: () => ({
        url: "/process-type/user",
        method: "GET",
      }),
      providesTags: ["ProcessType"],
    }),

    // Yangi jarayon turi yaratish
    createProcessType: builder.mutation({
      query: (body) => ({
        url: "/process-type/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProcessType"],
    }),

    // Jarayon turini ID orqali tahrirlash
    editProcessTypeById: builder.mutation({
      query: ({ id, body }) => ({
        url: `/process-type/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ProcessType"],
    }),

    // Jarayon turini ID orqali o‘chirish
    deleteProcessTypeById: builder.mutation({
      query: (id) => ({
        url: `/process-type/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProcessType"],
    }),
  }),
});

export const {
  useGetProcessTypesQuery,
  useGetProcessTypesByUserQuery,
  useCreateProcessTypeMutation,
  useEditProcessTypeByIdMutation,
  useDeleteProcessTypeByIdMutation,
} = processTypeApi;
