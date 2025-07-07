// import { api } from "./api";

// export const clientApi = api.injectEndpoints({
//   endpoints: (builder) => ({
//     createClient: builder.mutation({
//       query: (body) => ({
//         url: "/client/create",
//         method: "POST",
//         body,
//       }),
//       invalidatesTags: ["Client", "Sale"]
//     }),
//     getClient: builder.query({
//       query: () => ({
//         url: "/client/get",
//         method: "GET",
//       }),
//       providesTags: ["Client", "Sale"],
//     }),
//     depositToClient: builder.mutation({
//       query: ({ client_id, body }) => ({
//         url: `/client/deposit/${client_id}`,
//         method: "POST",
//         body,
//       }),
//       invalidatesTags: ["Client", "Sale"]

//     }),
//     editClient: builder.mutation({
//       query: ({ client_id, body }) => ({
//         url: `/client/edit/${client_id}`,
//         method: "PUT",
//         body,
//       }),
//       invalidatesTags: ["Client"]
//     }),
//   }),
// });

// export const {
//   useCreateClientMutation,
//   useGetClientQuery,
//   useDepositToClientMutation,
//   useEditClientMutation
// } = clientApi;
