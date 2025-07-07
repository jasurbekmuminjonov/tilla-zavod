// import { api } from "./api";

// export const deliveryApi = api.injectEndpoints({
//   endpoints: (builder) => ({
//     createDelivery: builder.mutation({
//       query: ({ order_id, body }) => ({
//         url: `/delivery/create/${order_id}`,
//         method: "POST",
//         body,
//       }),
//       invalidatesTags: ["Delivery", "Product", "Warehouse", "Order"]
//     }),
//     getDelivery: builder.query({
//       query: () => ({
//         url: "/delivery/get",
//         method: "GET",
//       }),
//       providesTags: ["Delivery", "Product", "Warehouse"],
//     }),
//   }),
// });

// export const { useCreateDeliveryMutation, useGetDeliveryQuery } = deliveryApi;
