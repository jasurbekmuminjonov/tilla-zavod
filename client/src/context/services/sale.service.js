// import { api } from "./api";

// export const saleApi = api.injectEndpoints({
//   endpoints: (builder) => ({
//     createSale: builder.mutation({
//       query: (body) => ({
//         url: "/sale/create",
//         method: "POST",
//         body,
//       }),
//       invalidatesTags: ["Sale", "Warehouse"]
//     }),
//     getSale: builder.query({
//       query: () => ({
//         url: "/sale/get",
//         method: "GET",
//       }),
//       providesTags: ["Sale", "Client"],
//     }),
//     createPaymentToSale: builder.mutation({
//       query: ({ saleId, body }) => ({
//         url: `/sale/${saleId}/payment`,
//         method: "POST",
//         body: body
//       }),
//       invalidatesTags: ["Sale", "Client"]
//     }),
//     createPaymentFromClient: builder.mutation({
//       query: ({ saleId, body }) => ({
//         url: `/sale/${saleId}/payment/client`,
//         method: "POST",
//         body: body
//       }),
//       invalidatesTags: ["Sale"]
//     }),
//     deleteSale: builder.mutation({
//       query: (saleId) => ({
//         url: `/sale/delete/${saleId}`,
//         method: "DELETE"
//       }),
//       invalidatesTags: ["Sale", "Warehouse"]
//     }),
//   }),

// });

// export const { useCreateSaleMutation, useGetSaleQuery, useCreatePaymentToSaleMutation, useCreatePaymentFromClientMutation, useDeleteSaleMutation } = saleApi;
