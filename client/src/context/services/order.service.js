// import { api } from "./api"

// export const orderApi = api.injectEndpoints({
//     endpoints: (builder) => ({
//         getOrder: builder.query({
//             query: () => ({
//                 url: "/order/get",
//                 method: "GET",
//             }),
//             providesTags: ["Order", "Factory"],
//         }),
//         createOrder: builder.mutation({
//             query: (body) => ({
//                 url: '/order/create',
//                 method: "POST",
//                 body: body
//             }),
//             invalidatesTags: ["Order", "Factory"]
//         }),
//         createPayment: builder.mutation({
//             query: ({ orderId, body }) => ({
//                 url: `/order/${orderId}/payment`,
//                 method: "POST",
//                 body: body
//             }),
//             invalidatesTags: ["Order", "Factory"]
//         }),
//         createPaymentFromFactory: builder.mutation({
//             query: ({ orderId, body }) => ({
//                 url: `/order/${orderId}/payment/factory`,
//                 method: "POST",
//                 body: body
//             }),
//             invalidatesTags: ["Order"]
//         }),
//         deleteOrder: builder.mutation({
//             query: (orderId) => ({
//                 url: `/order/delete/${orderId}`,
//                 method: "DELETE"
//             }),
//             invalidatesTags: ["Order"]
//         }),
//     }),

// })

// export const { useGetOrderQuery, useCreateOrderMutation, useCreatePaymentMutation, useCreatePaymentFromFactoryMutation, useDeleteOrderMutation } = orderApi