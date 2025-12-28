// src/modules/teacher/categories/CategoryPage.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Skeleton,
  Space,
  Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { api } from "../../../api/api";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/categories`);
      setCategories(res.data);
    } catch (err) {
      console.log(err);
      message.error("Kategoriyalarni yuklashda xato");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (values) => {
    setTableLoading(true);
    try {
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory.id}`, values);
        message.success("Kategoriya muvaffaqiyatli yangilandi");
      } else {
        await api.post(`/categories`, values);
        message.success("Yangi kategoriya qo'shildi");
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      message.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setTableLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setTableLoading(true);
    try {
      await api.delete(`/categories/${id}`);
      message.success("Kategoriya o'chirildi");
      fetchCategories();
    } catch (err) {
      console.log(err);
      message.error("O'chirishda xato");
    } finally {
      setTableLoading(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Nomi", dataIndex: "name", key: "name" },
    {
      title: "Amallar",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCategory(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          />
          <Popconfirm
            title="O'chirishni tasdiqlang"
            onConfirm={() => handleDelete(record.id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button danger icon={<DeleteOutlined />} />
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
        }}
      >
        <h2>Kategoriyalar</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingCategory(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          Yangi kategoriya
        </Button>
      </div>

      {loading ? (
        <Skeleton active />
      ) : (
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={tableLoading}
          pagination={{ pageSize: 10 }}
        />
      )}

      <Modal
        title={editingCategory ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Kategoriya nomi"
            rules={[{ required: true, message: "Iltimos, nom kiriting!" }]}
          >
            <Input placeholder="Masalan: Fonetika" />
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

export default CategoryPage;
