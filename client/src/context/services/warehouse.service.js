import { api } from "./api";

export const warehouseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Omborlarni olish
    getWarehouses: builder.query({
      query: () => ({
        url: "/warehouse",
        method: "GET",
      }),
      providesTags: ["Warehouse"],
    }),

    // Yangi ombor yaratish
    createWarehouse: builder.mutation({
      query: (body) => ({
        url: "/warehouse/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Warehouse"],
    }),

    // Omborni tahrirlash
    editWarehouse: builder.mutation({
      query: ({ id, body }) => ({
        url: `/warehouse/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Warehouse"],
    }),

    // Omborni o'chirish
    deleteWarehouse: builder.mutation({
      query: (id) => ({
        url: `/warehouse/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Warehouse"],
    }),
  }),
});

export const {
  useGetWarehousesQuery,
  useCreateWarehouseMutation,
  useEditWarehouseMutation,
  useDeleteWarehouseMutation,
} = warehouseApi;
