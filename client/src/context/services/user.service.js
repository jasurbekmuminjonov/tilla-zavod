import { api } from "./api";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Barcha foydalanuvchilarni olish
    getUsers: builder.query({
      query: () => ({
        url: "/user",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // Bitta foydalanuvchini ID orqali olish
    getUserByUserId: builder.query({
      query: () => ({
        url: "/user/id",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // Yangi foydalanuvchi yaratish
    createUser: builder.mutation({
      query: (body) => ({
        url: "/user/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // Login qilish
    loginUser: builder.mutation({
      query: (body) => ({
        url: "/user/login",
        method: "POST",
        body,
      }),
    }),

    // Foydalanuvchini tahrirlash (ID orqali)
    editUser: builder.mutation({
      query: ({ id, body }) => ({
        url: `/user/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // Oddiy foydalanuvchi parolini tahrirlash
    editUserPassword: builder.mutation({
      query: ({ id, body }) => ({
        url: `/user/password/${id}`,
        method: "PUT",
        body,
      }),
    }),

    // Admin foydalanuvchi parolini tahrirlash
    editAdminPassword: builder.mutation({
      query: ({ id, body }) => ({
        url: `/user/password/admin/${id}`,
        method: "PUT",
        body,
      }),
    }),

    // Foydalanuvchini o'chirish
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByUserIdQuery,
  useCreateUserMutation,
  useLoginUserMutation,
  useEditUserMutation,
  useEditUserPasswordMutation,
  useEditAdminPasswordMutation,
  useDeleteUserMutation,
} = userApi;
