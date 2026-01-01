import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Skeleton,
  Space,
  Popconfirm,
  Tag,
  InputNumber,
  Card,
  Typography,
  
} from "antd";
import {
  PlusOutlined,
  CopyOutlined,
  ShareAltOutlined,
  LinkOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import { api } from "../../../api/api";

const { TextArea } = Input;
const { Title , Text} = Typography;

const TeacherQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form] = Form.useForm();
  const [copiedCategory, setCopiedCategory] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const baseTestUrl = window.location.origin + "/questions";

  const getCategoryTestUrl = (categoryId) => `${baseTestUrl}/${categoryId}`;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get(`/categories`);
      setCategories(res.data);
    } catch (err) {
      message.error("Kategoriyalarni yuklashda xato");
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/questions/all`);
      setQuestions(res.data);
    } catch (err) {
      message.error("Savollarni yuklashda xato");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchQuestions();
  }, []);

  const handleCopyCategoryLink = (category) => {
    const testUrl = getCategoryTestUrl(category.id);
    navigator.clipboard.writeText(testUrl).then(() => {
      setCopiedCategory(category.id);
      message.success(`${category.name} testi havolasi nusxalandi!`);
      setTimeout(() => setCopiedCategory(null), 2000);
    });
  };

  const handleCopyAllLinks = () => {
    const links = categories
      .map((cat) => `${cat.name}: ${getCategoryTestUrl(cat.id)}`)
      .join("\n");
    navigator.clipboard.writeText(links).then(() => {
      setCopiedAll(true);
      message.success("Barcha linklar nusxalandi!");
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  const handleSubmit = async (values) => {
    setTableLoading(true);
    try {
      if (values.options) {
        values.options = values.options.filter(
          (opt) => opt && opt.trim() !== ""
        );
      }

      if (editingQuestion) {
        await api.patch(`/questions/${editingQuestion.id}`, values);
        message.success("Savol yangilandi");
      } else {
        await api.post(`/questions`, values);
        message.success("Yangi savol qo'shildi");
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err) {
      message.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setTableLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setTableLoading(true);
    try {
      await api.delete(`/questions/${id}`);
      message.success("Savol o'chirildi");
      fetchQuestions();
    } catch (err) {
      message.error("O'chirishda xato");
    } finally {
      setTableLoading(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "Savol",
      dataIndex: "question",
      key: "question",
      ellipsis: true,
      responsive: ["md"],
    },
    {
      title: "Turi",
      key: "type",
      width: 100,
      render: (_, record) => (
        <Tag color={record.options ? "blue" : "green"}>
          {isMobile
            ? record.options
              ? "Var"
              : "Matn"
            : record.options
            ? "Variantli"
            : "Matnli"}
        </Tag>
      ),
    },
    {
      title: "Kategoriya",
      key: "category",
      responsive: ["lg"],
      render: (_, record) => record.category?.name || "-",
    },
    {
      title: "Amallar",
      key: "action",
      fixed: isMobile ? false : "right",
      width: 100,
      render: (_, record) => (
        <Space size={isMobile ? "small" : "middle"}>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingQuestion(record);
              form.setFieldsValue({
                question: record.question,
                options: record.options || [],
                correctAnswerIndex: record.correctAnswerIndex,
                correctTextAnswer: record.correctTextAnswer,
                categoryId: record.category?.id,
              });
              setIsModalOpen(true);
            }}
          />
          <Popconfirm
            title="O'chirishni tasdiqlang"
            onConfirm={() => handleDelete(record.id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Sarlavha va tugmalar */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          gap: 12,
        }}
      >
        <div>
          <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
            Savollar boshqaruvi
          </Title>
          <Text type="secondary"  style={{ fontSize: 13 }}>
            <MobileOutlined style={{ marginRight: 4 }} />
            O'quvchilarga linklarni quyidan nusxalang
          </Text>
        </div>

        <Space
          direction={isMobile ? "vertical" : "horizontal"}
          size={12}
          style={{ width: isMobile ? "100%" : "auto" }}
        >
          <Button
            icon={<ShareAltOutlined />}
            onClick={handleCopyAllLinks}
            type={copiedAll ? "primary" : "default"}
            block={isMobile}
          >
            Barcha linklar
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingQuestion(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
            block={isMobile}
          >
            Yangi savol
          </Button>
        </Space>
      </div>

      {loading ? (
        <Skeleton active />
      ) : (
        <>
          {/* Test linklari — mobil uchun kartochkalar */}
          {categories.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ color: "#1890ff", marginBottom: 16 }}>
                <LinkOutlined style={{ marginRight: 8 }} />
                Test havolalari
              </Title>

              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                {categories.map((cat) => {
                  const testUrl = getCategoryTestUrl(cat.id);
                  return (
                    <Card
                      key={cat.id}
                      size="small"
                      style={{
                        borderLeft: "4px solid #1890ff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                      bodyStyle={{ padding: "12px 16px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 12,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: "bold",
                              fontSize: 15,
                              marginBottom: 4,
                            }}
                          >
                            {cat.name}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#555",
                              fontFamily: "monospace",
                              wordBreak: "break-all",
                              background: "#f5f5f5",
                              padding: "6px 8px",
                              borderRadius: 4,
                            }}
                          >
                            {testUrl}
                          </div>
                        </div>
                        <Button
                          type="primary"
                          size={isMobile ? "middle" : "middle"}
                          icon={
                            copiedCategory === cat.id ? (
                              <CheckOutlined />
                            ) : (
                              <CopyOutlined />
                            )
                          }
                          onClick={() => handleCopyCategoryLink(cat)}
                        >
                          {isMobile && copiedCategory === cat.id
                            ? ""
                            : isMobile
                            ? "Nusxa"
                            : "Nusxalash"}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </Space>
            </div>
          )}

          {/* Jadval */}
          <Table
            columns={columns}
            dataSource={questions}
            rowKey="id"
            loading={tableLoading}
            pagination={{
              pageSize: isMobile ? 5 : 10,
              showSizeChanger: !isMobile,
            }}
            scroll={{ x: isMobile ? 800 : 1200 }}
            size={isMobile ? "small" : "middle"}
          />
        </>
      )}

      {/* Modal — mobil uchun to'liq ekran */}
      <Modal
        title={editingQuestion ? "Savolni tahrirlash" : "Yangi savol qo'shish"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingQuestion(null);
        }}
        footer={null}
        width={isMobile ? "100%" : 700}
        style={isMobile ? { top: 0, margin: 0 } : {}}
        bodyStyle={
          isMobile
            ? { padding: "16px", maxHeight: "80vh", overflowY: "auto" }
            : {}
        }
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="question"
            label="Savol matni"
            rules={[{ required: true, message: "Savol matnini kiriting!" }]}
          >
            <TextArea rows={3} placeholder="Savol matnini kiriting..." />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Kategoriya"
            rules={[{ required: true, message: "Kategoriyani tanlang!" }]}
          >
            <Select placeholder="Kategoriyani tanlang">
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Variantlar (ixtiyoriy)">
            <Form.List name="options">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Space
                      key={key}
                      align="baseline"
                      style={{ display: "flex", marginBottom: 8 }}
                    >
                      <Form.Item
                        name={[name]}
                        rules={[
                          { required: true, message: "Variantni kiriting" },
                        ]}
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Input placeholder={`Variant ${name + 1}`} />
                      </Form.Item>
                      <Button danger onClick={() => remove(name)}>
                        O'chirish
                      </Button>
                    </Space>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Variant qo'shish
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.options !== curr.options}
          >
            {({ getFieldValue }) => {
              const hasOptions = getFieldValue("options")?.some((opt) =>
                opt?.trim()
              );
              return hasOptions ? (
                <Form.Item
                  name="correctAnswerIndex"
                  label="To'g'ri javob indeksi (0 dan boshlab)"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={0}
                    max={
                      (getFieldValue("options") || []).filter(Boolean).length -
                      1
                    }
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name="correctTextAnswer"
                  label="To'g'ri matnli javob"
                  rules={[{ required: true }]}
                >
                  <TextArea
                    rows={2}
                    placeholder="Talaba yozishi kerak bo'lgan javob"
                  />
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={tableLoading}
              block
            >
              Saqlash
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherQuestions;
