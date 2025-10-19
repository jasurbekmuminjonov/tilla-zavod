import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Layout as AntLayout, Modal, Space } from "antd";
import { FaRegBell } from "react-icons/fa";
import { useState } from "react";
// import { useGetNotificationQuery } from "../context/services/notification.service";
import { ImExit } from "react-icons/im";
const { Content, Header } = AntLayout;

const Layout = () => {
  const [notificationModal, setNotificationModal] = useState(false);
  // const { data: notifications = [] } = useGetNotificationQuery();
  return (
    <AntLayout>
      <Sidebar />
      <AntLayout>
        <Modal
          footer={null}
          open={notificationModal}
          onCancel={() => setNotificationModal(false)}
          title="Bildirishnomalar"
        ></Modal>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f5f5f5",
            borderBottom: "1px solid #ccc",
            gap: "15px",
            paddingInline: "10px",
          }}
        >
          <h2>{JSON.parse(localStorage.getItem("user")).name}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            {/* <FaRegBell
              onClick={() => setNotificationModal(true)}
              style={{ cursor: "pointer", margin: "5px" }}
              size={20}
            /> */}
            <ImExit
              color="red"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/";
              }}
              style={{ cursor: "pointer", margin: "5px" }}
              size={20}
            />
          </div>
        </Header>
        <Content style={{ paddingInline: "15px" }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
