// import { api } from "./api";

// export const backupApi = api.injectEndpoints({
//     endpoints: (builder) => ({
//         createBackup: builder.mutation({
//             query: (body) => ({
//                 url: "/backup",
//                 method: "POST",
//                 body,
//             }),
//             invalidatesTags: ["Backup"]
//         }),
//         getLastBackup: builder.query({
//             query: () => ({
//                 url: "/backup",
//                 method: "GET",
//             }),
//             providesTags: ["Backup"],
//         })
//     })
// });

// export const {
//     useCreateBackupMutation,
//     useGetLastBackupQuery
// } = backupApi;
