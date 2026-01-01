import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Tag,
  Space,
  message,
  Skeleton,
  Typography,
  Statistic,
  Card,
  Row,
  Col,
  Input,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import { api } from "../../../api/api";

const { Title } = Typography;

const TeacherStudentsResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [categories, setCategories] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Mobil aniqlash
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/results/teacher-all`);
      setResults(res.data);
    } catch (err) {
      message.error("Natijalarni yuklashda xato yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get(`/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("Kategoriyalar yuklanmadi");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchResults();
  }, []);

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : `Kategoriya ${categoryId}`;
  };

  const showDetailedAnswers = (record) => {
    setSelectedResult(record);
    setIsModalOpen(true);
  };

  const handleSearch = async () => {
    if (!searchName.trim()) {
      fetchResults();
      return;
    }
    setTableLoading(true);
    try {
      const res = await api.get(
        `/results/by-student/${encodeURIComponent(searchName)}`
      );
      setResults(res.data || []);
    } catch (err) {
      message.error("O'quvchi topilmadi");
      setResults([]);
    } finally {
      setTableLoading(false);
    }
  };

  // Vaqtni chiroyli formatda ko'rsatish
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // O'rtacha hisoblar
  const totalTests = results.length;
  const avgPercentage =
    totalTests > 0
      ? (
          results.reduce(
            (sum, r) => sum + (r.totalScore / r.totalQuestions) * 100,
            0
          ) / totalTests
        ).toFixed(1)
      : 0;
  const avgTime =
    totalTests > 0
      ? Math.round(
          results.reduce((sum, r) => sum + r.timeSpent, 0) / totalTests
        )
      : 0;

  const columns = [
    {
      title: "O'quvchi",
      dataIndex: "studentFullName",
      key: "studentFullName",
      ellipsis: true,
      sorter: (a, b) => a.studentFullName.localeCompare(b.studentFullName),
    },
    {
      title: "Kategoriya",
      key: "category",
      render: (_, record) => getCategoryName(record.categoryId),
      responsive: ["md"],
    },
    {
      title: "Natija",
      key: "score",
      render: (_, record) => (
        <div>
          <Tag
            color={
              record.totalScore >= record.totalQuestions * 0.8
                ? "green"
                : record.totalScore >= record.totalQuestions * 0.5
                ? "orange"
                : "red"
            }
          >
            {record.totalScore}/{record.totalQuestions}
          </Tag>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            {((record.totalScore / record.totalQuestions) * 100).toFixed(0)}%
          </div>
        </div>
      ),
      sorter: (a, b) =>
        a.totalScore / a.totalQuestions - b.totalScore / b.totalQuestions,
    },
    {
      title: "Vaqt",
      dataIndex: "timeSpent",
      key: "timeSpent",
      render: (sec) => formatTime(sec),
      responsive: ["lg"],
      sorter: (a, b) => a.timeSpent - b.timeSpent,
    },
    {
      title: "Sana",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("uz-UZ"),
      responsive: ["xl"],
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
    },
    {
      title: "Amal",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => showDetailedAnswers(record)}
        >
          Batafsil
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={isMobile ? 3 : 2} style={{ marginBottom: 24 }}>
        O'quvchilar Natijalari
      </Title>

      {/* Qidiruv */}
      <Card style={{ marginBottom: 24 }}>
        <Space
          direction={isMobile ? "vertical" : "horizontal"}
          size={12}
          style={{ width: "100%" }}
        >
          <Input
            placeholder="O'quvchi ism-sharifini kiriting"
            prefix={<UserOutlined />}
            suffix={isMobile && <MobileOutlined style={{ color: "#999" }} />}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            style={{ width: isMobile ? "100%" : 300 }}
          />
          <div>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={tableLoading}
            >
              Qidirish
            </Button>
            <Button onClick={fetchResults} style={{ marginLeft: 8 }}>
              Barchasi
            </Button>
          </div>
        </Space>
      </Card>

      {/* Statistika kartalari */}
      {totalTests > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="Jami topshiruvlar"
                value={totalTests}
                prefix={<TrophyOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="O'rtacha ball"
                value={avgPercentage}
                suffix="%"
                precision={1}
                valueStyle={{
                  color:
                    avgPercentage >= 80
                      ? "#52c41a"
                      : avgPercentage >= 50
                      ? "#faad14"
                      : "#f5222d",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="O'rtacha vaqt"
                value={formatTime(avgTime)}
                prefix={<ClockCircleOutlined style={{ color: "#722ed1" }} />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Jadval */}
      {loading ? (
        <Skeleton active />
      ) : results.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <Title level={4} type="secondary">
              Natijalar topilmadi
            </Title>
            <p>
              Iltimos, o'quvchi ismini to'g'ri kiriting yoki barcha natijalarni
              ko'rish uchun "Barchasi" tugmasini bosing.
            </p>
          </div>
        </Card>
      ) : (
        <Table
          columns={columns}
          dataSource={results}
          rowKey="id"
          loading={tableLoading}
          pagination={{
            pageSize: isMobile ? 8 : 10,
            showSizeChanger: !isMobile,
          }}
          scroll={{ x: isMobile ? 800 : 1000 }}
          size={isMobile ? "small" : "middle"}
        />
      )}

      {/* Batafsil javoblar modal */}
      <Modal
        title={
          <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: "bold" }}>
            {selectedResult?.studentFullName} —{" "}
            {getCategoryName(selectedResult?.categoryId)}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={isMobile ? "100%" : 800}
        style={isMobile ? { top: 0, margin: 0 } : {}}
        bodyStyle={
          isMobile
            ? { padding: "16px", maxHeight: "85vh", overflowY: "auto" }
            : {}
        }
      >
        {selectedResult && (
          <div>
            {/* Umumiy natija */}
            <Card style={{ marginBottom: 20, background: "#f0f5ff" }}>
              <Space size={12} wrap>
                <Tag color="blue" style={{ fontSize: 14, padding: "6px 12px" }}>
                  <strong>
                    {selectedResult.totalScore} /{" "}
                    {selectedResult.totalQuestions}
                  </strong>{" "}
                  to'g'ri
                </Tag>
                <Tag
                  color="purple"
                  style={{ fontSize: 14, padding: "6px 12px" }}
                >
                  {(
                    (selectedResult.totalScore /
                      selectedResult.totalQuestions) *
                    100
                  ).toFixed(1)}
                  %
                </Tag>
                <Tag
                  icon={<ClockCircleOutlined />}
                  style={{ fontSize: 14, padding: "6px 12px" }}
                >
                  {formatTime(selectedResult.timeSpent)}
                </Tag>
              </Space>
            </Card>

            <Title level={4} style={{ margin: "24px 0 16px" }}>
              Javoblar tafsiloti
            </Title>

            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              {selectedResult.detailedAnswers?.map((ans, index) => {
                const question = selectedResult.detailedQuestions?.[index];
                const isCorrect =
                  ans.userAnswerIndex !== undefined
                    ? ans.userAnswerIndex === question?.correctAnswerIndex
                    : ans.userAnswerText?.trim().toLowerCase() ===
                      question?.correctTextAnswer?.trim().toLowerCase();

                return (
                  <Card
                    key={index}
                    size="small"
                    title={
                      <span style={{ fontSize: 14 }}>Savol {index + 1}</span>
                    }
                    style={{
                      borderLeft: `4px solid ${
                        isCorrect ? "#52c41a" : "#f5222d"
                      }`,
                    }}
                  >
                    {question && (
                      <p style={{ margin: "8px 0", fontSize: 14 }}>
                        <strong>Savol:</strong> {question.question}
                      </p>
                    )}

                    <p style={{ margin: "12px 0" }}>
                      <strong>Javob:</strong>{" "}
                      {ans.userAnswerIndex !== undefined ? (
                        ans.userAnswerIndex === -1 ? (
                          <Tag color="default">Javob berilmagan</Tag>
                        ) : (
                          <Tag color="blue">
                            Variant {ans.userAnswerIndex + 1}
                          </Tag>
                        )
                      ) : ans.userAnswerText ? (
                        <span
                          style={{
                            fontFamily: "monospace",
                            background: "#f9f9f9",
                            padding: "2px 6px",
                            borderRadius: 4,
                          }}
                        >
                          "{ans.userAnswerText}"
                        </span>
                      ) : (
                        <Tag color="default">Bo'sh</Tag>
                      )}
                    </p>

                    <Tag
                      icon={
                        isCorrect ? (
                          <CheckCircleOutlined />
                        ) : (
                          <CloseCircleOutlined />
                        )
                      }
                      color={isCorrect ? "green" : "red"}
                      style={{ fontSize: 13 }}
                    >
                      {isCorrect ? "To'g'ri" : "Noto'g'ri"}
                    </Tag>
                  </Card>
                );
              })}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherStudentsResults;
