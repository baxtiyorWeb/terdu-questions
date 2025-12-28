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

  // Barcha natijalarni yuklash
  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/results/teacher-all`);
      setResults(res.data);
    } catch (err) {
        console.log(err)
      message.error("Natijalarni yuklashda xato yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  // Kategoriyalarni yuklash (kategoriya nomini ko'rsatish uchun)
  const fetchCategories = async () => {
    try {
      const res = await api.get(`/categories`);
      setCategories(res.data);
    } catch (err) {
        console.log(err)
      console.error("Kategoriyalar yuklanmadi");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchResults();
  }, []);

  // Kategoriya nomini topish
  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : `Kategoriya ${categoryId}`;
  };

  // Batafsil javoblarni ko'rish
  const showDetailedAnswers = async (record) => {
    setTableLoading(true);
    try {
      // Agar detailedAnswers bo'sh bo'lsa, backenddan qayta olish mumkin emas,
      // lekin bizda saqlangan detailedAnswers bor
      setSelectedResult(record);
      setIsModalOpen(true);
    } catch (err) {
      console.log(err);
      message.error("Ma'lumot yuklanmadi");
    } finally {
      setTableLoading(false);
    }
  };

  // O'quvchi nomiga qarab qidirish
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
      setResults(res.data);
    } catch (err) {
      console.log(err);
      message.error("O'quvchi topilmadi");
      setResults([]);
    } finally {
      setTableLoading(false);
    }
  };

  const columns = [
    {
      title: "O'quvchi",
      dataIndex: "studentFullName",
      key: "studentFullName",
      sorter: (a, b) => a.studentFullName.localeCompare(b.studentFullName),
    },
    {
      title: "Kategoriya",
      key: "category",
      render: (_, record) => getCategoryName(record.categoryId),
    },
    {
      title: "Natija",
      key: "score",
      render: (_, record) => (
        <Space>
          <Tag
            color={
              record.totalScore >= record.totalQuestions * 0.8
                ? "green"
                : record.totalScore >= record.totalQuestions * 0.5
                ? "orange"
                : "red"
            }
          >
            {record.totalScore} / {record.totalQuestions}
          </Tag>
          <Tag>
            {((record.totalScore / record.totalQuestions) * 100).toFixed(1)}%
          </Tag>
        </Space>
      ),
      sorter: (a, b) =>
        a.totalScore / a.totalQuestions - b.totalScore / b.totalQuestions,
    },
    {
      title: "Vaqt",
      dataIndex: "timeSpent",
      key: "timeSpent",
      render: (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}d ${secs}s`;
      },
      sorter: (a, b) => a.timeSpent - b.timeSpent,
    },
    {
      title: "Sana",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString("uz-UZ"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
    },
    {
      title: "Amallar",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => showDetailedAnswers(record)}>
          Batafsil
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>O'quvchilar Natijalari</Title>

      {/* Qidiruv paneli */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Input
              placeholder="O'quvchi ism-sharifini kiriting"
              prefix={<UserOutlined />}
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col span={12}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={tableLoading}
              >
                Qidirish
              </Button>
              <Button onClick={fetchResults}>Barchasi</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Umumiy statistika */}
      {results.length > 0 && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Jami topshiruvlar"
                value={results.length}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="O'rtacha ball"
                value={(
                  results.reduce(
                    (sum, r) => sum + (r.totalScore / r.totalQuestions) * 100,
                    0
                  ) / results.length
                ).toFixed(1)}
                suffix="%"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="O'rtacha vaqt"
                value={Math.round(
                  results.reduce((sum, r) => sum + r.timeSpent, 0) /
                    results.length
                )}
                prefix={<ClockCircleOutlined />}
                suffix="sek"
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Jadval */}
      {loading ? (
        <Skeleton active />
      ) : (
        <Table
          columns={columns}
          dataSource={results}
          rowKey="id"
          loading={tableLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      )}

      {/* Batafsil javoblar modal */}
      <Modal
        title={`Natija: ${selectedResult?.studentFullName} — ${getCategoryName(
          selectedResult?.categoryId
        )}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        {selectedResult && (
          <>
            <Space
              direction="vertical"
              style={{ width: "100%", marginBottom: 16 }}
            >
              <Tag color="blue">
                {selectedResult.totalScore} / {selectedResult.totalQuestions}{" "}
                to'g'ri javob
              </Tag>
              <Tag>
                {(
                  (selectedResult.totalScore / selectedResult.totalQuestions) *
                  100
                ).toFixed(1)}
                %
              </Tag>
              <Tag>
                Vaqt: {Math.floor(selectedResult.timeSpent / 60)}d{" "}
                {selectedResult.timeSpent % 60}s
              </Tag>
            </Space>

            <Title level={4}>Javoblar tafsiloti:</Title>
            {selectedResult.detailedAnswers?.map((ans, index) => {
              const isCorrect =
                ans.userAnswerIndex !== undefined
                  ? ans.userAnswerIndex ===
                    selectedResult.detailedAnswers[index]?.correctIndex // backendda saqlanmagan, faqat hisoblangan
                  : ans.userAnswerText?.trim().toLowerCase() ===
                    selectedResult.detailedAnswers[index]?.correctText
                      ?.trim()
                      .toLowerCase();

              return (
                <Card
                  key={index}
                  size="small"
                  style={{ marginBottom: 12 }}
                  title={`Savol ${index + 1}`}
                >
                  <p>
                    <strong>Foydalanuvchi javobi:</strong>{" "}
                    {ans.userAnswerIndex !== undefined &&
                    ans.userAnswerIndex >= 0 ? (
                      `Variant ${ans.userAnswerIndex + 1}`
                    ) : ans.userAnswerIndex === -1 ? (
                      <Tag color="default">Javob berilmagan</Tag>
                    ) : (
                      ans.userAnswerText || <Tag color="default">Bo'sh</Tag>
                    )}
                  </p>
                  <Tag color={isCorrect ? "green" : "red"}>
                    {isCorrect ? "To'g'ri" : "Noto'g'ri"}
                  </Tag>
                </Card>
              );
            })}
          </>
        )}
      </Modal>
    </div>
  );
};

export default TeacherStudentsResults;
