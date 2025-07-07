// import { api } from "./api";

// export const rejectionApi = api.injectEndpoints({
//   endpoints: (builder) => ({
//     createRejectedProduct: builder.mutation({
//       query: (body) => ({
//         url: "/rejection/create",
//         method: "POST",
//         body,
//       }),
//     }),
//     getRejectedProduct: builder.query({
//       query: () => ({
//         url: "/rejection/get",
//         method: "GET",
//       }),
//       providesTags: ["RejectedProduct"],
//     }),
//   }),
// });

// export const {
//   useCreateRejectedProductMutation,
//   useGetRejectedProductQuery,
// } = rejectionApi;
