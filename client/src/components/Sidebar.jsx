import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import { sidebarLinks } from "../assets/sidebarLinks";
import { useGetFactoryQuery } from "../context/services/factory.service";
const { Title } = Typography;

import { Typography } from "antd";
import { useState } from "react";
import { useGetUserByUserIdQuery } from "../context/services/user.service";

const { Sider } = Layout;

const Sidebar = () => {
  const location = useLocation();
  const { data: self = {} } = useGetUserByUserIdQuery();
  const [collapsed, setCollapsed] = useState(false);
  const { data: factory = {} } = useGetFactoryQuery();
  const baseStyle = {
    minHeight: "100vh",
    background: "#000",
    display: "flex",
    flexDirection: "column",
  };

  const style = collapsed
    ? { ...baseStyle, paddingBlockStart: "64px" }
    : baseStyle;
  return (
    <Sider
      collapsible={window.innerWidth >= 1100}
      collapsed={window.innerWidth >= 1100 ? collapsed : true}
      onCollapse={setCollapsed}
      width={220}
      style={style}
    >
      {!collapsed && window.innerWidth >= 1100 && (
        <Title
          level={3}
          onClick={() => (window.location.href = "/")}
          style={{
            color: "#fff",
            display: "flex",
            justifySelf: "center",
            margin: "16px 0",
          }}
        >
          {factory.factory_name}
        </Title>
      )}
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={[location.pathname]}
        style={{ height: "100%", borderRight: 0, background: "#000" }}
      >
        {sidebarLinks.map((link) => (
          <Menu.Item key={link.path} icon={link.icon}>
            <Link to={link.path}>{link.label}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default Sidebar;
