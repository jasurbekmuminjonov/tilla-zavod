import { api } from "./api";

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotification: builder.query({
      query: () => ({
        url: "/notification/get",
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),
  }),
});

export const { useGetNotificationQuery } = notificationApi;
