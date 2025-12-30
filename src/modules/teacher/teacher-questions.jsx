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
} from "antd";
import {
  PlusOutlined,
  CopyOutlined,
  ShareAltOutlined,
  LinkOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { api } from "../../../api/api";

const { TextArea } = Input;

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

  // Joriy sahifa URL — categoryId orqali testga o'tish
  const baseTestUrl = window.location.origin + "/questions";
  const getCategoryTestUrl = (categoryId) => {
    return `${baseTestUrl}/${categoryId}`; // Endi faqat ID ishlatiladi
  };

  // Kategoriyalarni yuklash
  const fetchCategories = async () => {
    try {
      const res = await api.get(`/categories`);
      setCategories(res.data);
    } catch (err) {
      console.log(err);
      message.error("Kategoriyalarni yuklashda xato");
    }
  };

  // Savollarni yuklash
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/questions/all`);
      setQuestions(res.data);
    } catch (err) {
      console.log(err);
      message.error("Savollarni yuklashda xato");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchQuestions();
  }, []);

  // Kategoriya linkini nusxalash (ID orqali)
  const handleCopyCategoryLink = (category) => {
    const testUrl = getCategoryTestUrl(category.id);
    navigator.clipboard.writeText(testUrl).then(() => {
      setCopiedCategory(category.id);
      message.success(`${category.name} testi havolasi nusxalandi!`);
      setTimeout(() => setCopiedCategory(null), 2000);
    });
  };

  // Barcha kategoriyalar linkini nusxalash
  const handleCopyAllLinks = () => {
    const links = categories
      .map((cat) => `${cat.name}: ${getCategoryTestUrl(cat.id)}`)
      .join("\n");
    navigator.clipboard.writeText(links).then(() => {
      setCopiedAll(true);
      message.success("Barcha kategoriyalar linklari nusxalandi!");
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
        message.success("Savol muvaffaqiyatli yangilandi");
      } else {
        await api.post(`/questions`, values);
        message.success("Yangi savol qo'shildi");
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err) {
      console.log(err);
      const errorMsg =
        err.response?.data?.message || "Saqlashda xatolik yuz berdi";
      message.error(errorMsg);
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
      console.log(err);
      message.error("O'chirishda xato");
    } finally {
      setTableLoading(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "Savol matni",
      dataIndex: "question",
      key: "question",
      ellipsis: true,
    },
    {
      title: "Turi",
      key: "type",
      render: (_, record) => (
        <Tag color={record.options ? "blue" : "green"}>
          {record.options ? "Variantli" : "Matnli"}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "Variantlar soni",
      key: "optionsCount",
      render: (_, record) => (record.options ? record.options.length : "-"),
      width: 120,
    },
    {
      title: "Kategoriya",
      key: "category",
      width: 200,
      render: (_, record) => (
        <Space>
          <span>{record.category?.name || "-"}</span>
          {record.category && (
            <Button
              size="small"
              icon={
                copiedCategory === record.category.id ? (
                  <CheckOutlined />
                ) : (
                  <CopyOutlined />
                )
              }
              onClick={() => handleCopyCategoryLink(record.category)}
              title={`"${record.category.name}" test havolasini nusxalash`}
            />
          )}
        </Space>
      ),
    },
    {
      title: "Amallar",
      key: "action",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space size="middle">
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
                categoryId: record.category.id,
              });
              setIsModalOpen(true);
            }}
          />
          <Popconfirm
            title="Savolni o'chirishni tasdiqlang"
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
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Savollar boshqaruvi</h2>
          <p style={{ color: "#666", margin: 4, fontSize: 14 }}>
            O'quvchilarga test linklarini quyidagi jadvaldan nusxalang
          </p>
        </div>

        <Space>
          <Button
            icon={<ShareAltOutlined />}
            onClick={handleCopyAllLinks}
            type={copiedAll ? "primary" : "default"}
          >
            Barcha linklarni nusxalash
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingQuestion(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Yangi savol
          </Button>
        </Space>
      </div>

      {loading ? (
        <Skeleton active />
      ) : (
        <>
          {/* Kategoriyalar uchun qisqa va toza linklar */}
          {categories.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 12, color: "#1890ff" }}>
                <LinkOutlined style={{ marginRight: 8 }} />
                Test linklari (o'quvchilarga yuboring)
              </h3>
              <div
                style={{
                  background: "#f0f5ff",
                  padding: 16,
                  borderRadius: 8,
                  border: "1px solid #bae7ff",
                }}
              >
                {categories.map((cat) => {
                  const testUrl = getCategoryTestUrl(cat.id);
                  return (
                    <div
                      key={cat.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        marginBottom: 8,
                        background: "#fff",
                        borderRadius: 8,
                        borderLeft: "4px solid #1890ff",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: 15 }}>{cat.name}</strong>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#333",
                            marginTop: 4,
                            fontFamily: "monospace",
                            wordBreak: "break-all",
                          }}
                        >
                          {testUrl}
                        </div>
                      </div>
                      <Button
                        size="middle"
                        type="primary"
                        icon={
                          copiedCategory === cat.id ? (
                            <CheckOutlined />
                          ) : (
                            <CopyOutlined />
                          )
                        }
                        onClick={() => handleCopyCategoryLink(cat)}
                        style={{
                          minWidth: 90,
                        }}
                      >
                        {copiedCategory === cat.id ? "Nusxalandi" : "Nusxalash"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Table
            columns={columns}
            dataSource={questions}
            rowKey="id"
            loading={tableLoading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
          />
        </>
      )}

      <Modal
        title={editingQuestion ? "Savolni tahrirlash" : "Yangi savol qo'shish"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingQuestion(null);
        }}
        footer={null}
        width={700}
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

          <Form.Item label="Javob variantlari (variantli savol uchun)">
            <Form.List name="options">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      align="baseline"
                      style={{
                        display: "flex",
                        marginBottom: 8,
                        width: "100%",
                      }}
                    >
                      <Form.Item
                        {...restField}
                        name={[name]}
                        rules={[
                          { required: true, message: "Variantni kiriting" },
                        ]}
                        style={{ flex: 1 }}
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
              const hasOptions =
                getFieldValue("options") &&
                getFieldValue("options").some(
                  (opt) => opt && opt.trim() !== ""
                );
              return hasOptions ? (
                <Form.Item
                  name="correctAnswerIndex"
                  label="To'g'ri javob indeksi"
                  rules={[
                    { required: true, message: "To'g'ri javobni tanlang!" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={
                      (getFieldValue("options") || []).filter(
                        (o) => o && o.trim()
                      ).length - 1
                    }
                    placeholder="Masalan: 0"
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name="correctTextAnswer"
                  label="To'g'ri matnli javob"
                  rules={[
                    { required: true, message: "To'g'ri javobni kiriting!" },
                  ]}
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
