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
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
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

  const handleSubmit = async (values) => {
    setTableLoading(true);
    try {
      // Variantlarni tozalash (bo'sh qatorlarni olib tashlash)
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
      dataIndex: ["category", "name"],
      key: "category",
      width: 150,
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
        }}
      >
        <h2>Savollar</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingQuestion(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          Yangi savol qo'shish
        </Button>
      </div>

      {loading ? (
        <Skeleton active />
      ) : (
        <Table
          columns={columns}
          dataSource={questions}
          rowKey="id"
          loading={tableLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
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
            <TextArea
              rows={3}
              placeholder="Masalan: O'zbek tilida qaysi tovush undosh hisoblanadi?"
            />
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

          <Form.Item label="Javob variantlari (agar variantli savol bo'lsa)">
            <Form.List name="options">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name]}
                        rules={[
                          {
                            required: true,
                            message: "Variant matnini kiriting",
                          },
                        ]}
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
                    placeholder="Masalan: 0 (birinchi variant)"
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name="correctTextAnswer"
                  label="To'g'ri matnli javob"
                  rules={[
                    {
                      required: true,
                      message: "Matnli javob uchun to'g'ri javobni kiriting!",
                    },
                  ]}
                >
                  <TextArea
                    rows={2}
                    placeholder="Talaba yozishi kerak bo'lgan to'g'ri javob"
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
