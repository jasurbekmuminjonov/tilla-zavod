// import { Layout, Menu } from "antd";
// import { Link, useLocation } from "react-router-dom";
// import { sidebarLinks } from "../assets/sidebarLinks";
// import { useGetFactoryQuery } from "../context/services/factory.service";
// const { Title } = Typography;

// import { Typography } from "antd";
// import { useState } from "react";

// const { Sider } = Layout;

// const Sidebar = () => {
//   const location = useLocation();
//   const [collapsed, setCollapsed] = useState(false);
//   const { data: factory = {} } = useGetFactoryQuery();
//   const baseStyle = {
//     minHeight: "100vh",
//     background: "#000",
//     display: "flex",
//     flexDirection: "column",
//   };

//   const style = collapsed
//     ? { ...baseStyle, paddingBlockStart: "64px" }
//     : baseStyle;
//   return (
//     <Sider
//       collapsible={window.innerWidth >= 1100}
//       collapsed={window.innerWidth >= 1100 ? collapsed : true}
//       onCollapse={setCollapsed}
//       width={220}
//       style={style}
//     >
//       {!collapsed && window.innerWidth >= 1100 && (
//         <Title
//           level={3}
//           onClick={() => (window.location.href = "/")}
//           style={{
//             color: "#fff",
//             display: "flex",
//             justifySelf: "center",
//             margin: "16px 0",
//           }}
//         >
//           {factory.factory_name}
//         </Title>
//       )}
//       <Menu
//         mode="inline"
//         theme="dark"
//         selectedKeys={[location.pathname]}
//         style={{ height: "100%", borderRight: 0, background: "#000" }}
//       >
//         {sidebarLinks.map((link) => (
//           <Menu.Item key={link.path} icon={link.icon}>
//             <Link to={link.path}>{link.label}</Link>
//           </Menu.Item>
//         ))}
//       </Menu>
//     </Sider>
//   );
// };

// export default Sidebar;

import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import { sidebarLinks } from "../assets/sidebarLinks";
import { useGetFactoryQuery } from "../context/services/factory.service";
import { Typography } from "antd";
import { useState } from "react";
import { GiDiamondRing } from "react-icons/gi";
import "./sidebar.css";

const { Title } = Typography;
const { Sider } = Layout;

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { data: factory = {} } = useGetFactoryQuery();

  const baseStyle = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
    display: "flex",
    flexDirection: "column",
    boxShadow: "4px 0 20px rgba(0, 0, 0, 0.3)",
    position: "relative",
    overflow: "hidden",
  };

  const style = collapsed
    ? { ...baseStyle, paddingBlockStart: "64px" }
    : baseStyle;

  return (
    <Sider
      collapsible={window.innerWidth >= 1100}
      collapsed={window.innerWidth >= 1100 ? collapsed : true}
      onCollapse={setCollapsed}
      width={240}
      style={style}
      className="custom-sidebar"
    >
      {/* Gradient overlay */}
      <div className="sidebar-overlay"></div>
      {/* Logo va nom */}
      {!collapsed && window.innerWidth >= 1100 && (
        <div className="sidebar-header">
          {/* <div className="logo-container">
            <GiDiamondRing className="logo-icon" />
          </div> */}
          <Title
            level={3}
            onClick={() => (window.location.href = "/")}
            className="factory-name"
          >
            {factory.factory_name || "Zargarlik"}
          </Title>
          <div className="header-divider"></div>
        </div>
      )}
      {/* Collapsed holat uchun faqat icon */}
      {collapsed && window.innerWidth >= 1100 && (
        <div className="sidebar-header-collapsed">
          <GiDiamondRing className="logo-icon-small" />
        </div>
      )}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        className="sidebar-menu"
      >
        {sidebarLinks.map((link) => (
          <Menu.Item key={link.path} icon={link.icon} className="menu-item">
            <Link to={link.path} className="menu-link">
              {link.label}
            </Link>
          </Menu.Item>
        ))}
      </Menu>
      {/* Footer decoration */}
      {!collapsed && window.innerWidth >= 1100 && (
        <div className="sidebar-footer">
          <div className="footer-text">Powered by ZargarTech</div>
        </div>
      )}
    </Sider>
  );
};

export default Sidebar;
