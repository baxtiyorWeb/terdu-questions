// src/modules/teacher/TeacherHome.jsx
import React from "react";
import { Card, Col, Row, Statistic, Typography } from "antd";
import {
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const TeacherHome = () => {
  return (
    <div>
      <Title level={2}>O'qituvchi paneliga xush kelibsiz!</Title>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Jami kategoriyalar"
              value={12}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Umumiy savollar"
              value={156}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Test topshirganlar"
              value={89}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="O'rtacha ball"
              value={78.4}
              precision={1}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TeacherHome;
