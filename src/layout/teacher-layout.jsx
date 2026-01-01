// src/modules/teacher/TeacherLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, theme, Typography, Space, Drawer } from "antd";
import logo_img from "./../../public/img/logo_tersu.png";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const TeacherLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const navigate = useNavigate();
  const location = useLocation();

  // Mobil ekran aniqlash
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true); // Mobilda menu yopiq bo'lsin
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuItems = [
    {
      key: "/teacher",
      icon: <HomeOutlined />,
      label: "Bosh sahifa",
    },
    {
      key: "/teacher/categories",
      icon: <AppstoreOutlined />,
      label: "Kategoriyalar",
    },
    {
      key: "/teacher/questions",
      icon: <UnorderedListOutlined />,
      label: "Savollar",
    },
    {
      key: "/teacher/results",
      icon: <BarChartOutlined />,
      label: "Natijalar",
    },
  ];

  const currentKey =
    menuItems.find((item) => item.key === location.pathname)?.key || "/teacher";

  const handleLogout = () => {
    localStorage.removeItem("teaccher_access_token");
    localStorage.removeItem("user_role");
    navigate("/");
  };

  const siderContent = (
    <>
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          background: "rgba(255,255,255,0.1)",
        }}
      >
        <img
          src={logo_img}
          alt="Logo"
          style={{
            width: collapsed ? 50 : 80,
            transition: "0.3s",
            filter: "brightness(0) invert(1)",
          }}
        />
        {!collapsed && !isMobile && (
          <Title level={4} style={{ color: "white", margin: "10px 0 0" }}>
            TerDU Test
          </Title>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[currentKey]}
        onClick={({ key }) => {
          navigate(key);
          if (isMobile) setMobileMenuOpen(false);
        }}
        items={menuItems}
      />

      <div style={{ padding: "16px", marginTop: "auto" }}>
        <Button
          type="primary"
          danger
          block
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          {!collapsed && "Chiqish"}
        </Button>
      </div>
    </>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sider */}
      {!isMobile ? (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={250}
          style={{ position: "fixed", height: "100vh", left: 0, top: 0, bottom: 0 }}
        >
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {siderContent}
          </div>
        </Sider>
      ) : (
        /* Mobile Drawer */
        <Drawer
          placement="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          width={250}
          styles={{
            body: { padding: 0, background: "#001529" },
            header: { display: "none" },
          }}
        >
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {siderContent}
          </div>
        </Drawer>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 250), transition: "0.3s" }}>
        <Header
          style={{
            padding: "0 16px",
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,21,41,.08)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Button
            type="text"
            icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={() => isMobile ? setMobileMenuOpen(true) : setCollapsed(!collapsed)}
            style={{ fontSize: "18px", width: 64, height: 64 }}
          />
          <Space>
            <Text strong style={{ fontSize: isMobile ? 14 : 16 }}>
              O'qituvchi paneli
            </Text>
          </Space>
        </Header>

        <Content
          style={{
            margin: "16px",
            padding: "16px",
            minHeight: "calc(100vh - 64px)",
            background: colorBgContainer,
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherLayout;