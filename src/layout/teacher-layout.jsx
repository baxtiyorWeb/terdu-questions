// src/modules/teacher/TeacherLayout.jsx
import React, { useState } from "react";
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
import { Layout, Menu, Button, theme, Typography, Space } from "antd";
import logo_img from "./../../public/img/logo_tersu.png";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const TeacherLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={250}>
        <div
          className="demo-logo-vertical"
          style={{ padding: "20px", textAlign: "center" }}
        >
          <img
            src={logo_img}
            alt="Logo"
            style={{ width: collapsed ? 50 : 80, transition: "0.3s" }}
          />
          {!collapsed && (
            <Title level={4} style={{ color: "white", margin: "10px 0 0" }}>
              TerDU Test
            </Title>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentKey]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            padding: "16px",
          }}
        >
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
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,21,41,.08)",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", width: 64, height: 64 }}
          />
          <Space>
            <Text strong>O'qituvchi paneli</Text>
          </Space>
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
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
