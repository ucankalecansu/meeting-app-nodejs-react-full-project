import React, { useEffect, useState } from "react";
import { Table, Button, message, Popconfirm, Modal, Form, Input, DatePicker, Upload, Space, Tag } from "antd";
import { UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "../api/axios";
import dayjs from "dayjs";

const normalizeUpload = (e: any) => (Array.isArray(e) ? e : e?.fileList);


const Meetings: React.FC = () => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const fetchMeetings = async () => {
    try {
      const res = await axios.get("/meetings");
      setMeetings(res.data);
    } catch {
      message.error("Toplantılar yüklenemedi");
    }
  };

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: any) => {
    setEditingId(record.id);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      startDate: record.startDate ? dayjs(record.startDate) : undefined,
      endDate: record.endDate ? dayjs(record.endDate) : undefined,
      document: undefined, // mevcut dosyayı göstermek yerine yeni dosya seçtirmek
    });
    setOpen(true);
  };

  const deleteMeeting = async (id: number) => {
    try {
      await axios.delete(`/meetings/${id}`);
      message.success("Toplantı silindi");
      fetchMeetings();
    } catch {
      message.error("Silme hatası");
    }
  };

  const submitForm = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description || "");
      formData.append("startDate", values.startDate.toISOString());
      formData.append("endDate", values.endDate.toISOString());

      // Upload değeri: [{originFileObj: File, ...}]
      const fileObj = values.document?.[0]?.originFileObj;
      if (fileObj) formData.append("document", fileObj);

      if (editingId == null) {
        // CREATE
        await axios.post("/meetings", formData, { headers: { "Content-Type": "multipart/form-data" } });
        message.success("Toplantı eklendi");
      } else {
        // UPDATE
        await axios.put(`/meetings/${editingId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        message.success("Toplantı güncellendi");
      }

      setOpen(false);
      form.resetFields();
      fetchMeetings();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Kaydetme hatası");
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <div style={{ padding: 20 }}>
    <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
      <h2 style={{ margin: 0 }}>Toplantılar</h2>
      <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
        Toplantı Ekle
      </Button>
    </Space>

    <Table
      rowKey="id"
      dataSource={meetings}
      columns={[
        { title: "Başlık", dataIndex: "title" },
        { title: "Açıklama", dataIndex: "description", ellipsis: true },
        {
          title: "Başlangıç",
          dataIndex: "startDate",
          render: (v: string) => (v ? dayjs(v).format("DD.MM.YYYY HH:mm") : "-"),
        },
        {
          title: "Bitiş",
          dataIndex: "endDate",
          render: (v: string) => (v ? dayjs(v).format("DD.MM.YYYY HH:mm") : "-"),
        },
        {
          title: "Durum",
          dataIndex: "status",
          render: (s: string) =>
            s ? <Tag color={s === "cancelled" ? "red" : "green"}>{s}</Tag> : <Tag>—</Tag>,
        },
        {
          title: "İşlemler",
          render: (_: any, record: any) => (
            <Space>
              <Button icon={<EditOutlined />} onClick={() => openEdit(record)}>
                Düzenle
              </Button>
              <Popconfirm title="Silmek istediğine emin misin?" onConfirm={() => deleteMeeting(record.id)}>
                <Button danger icon={<DeleteOutlined />}>
                  Sil
                </Button>
              </Popconfirm>
            </Space>
          ),
        },
      ]}
    />

    <Modal
      title={editingId == null ? "Toplantı Ekle" : "Toplantıyı Düzenle"}
      open={open}
      onCancel={() => setOpen(false)}
      onOk={() => form.submit()}
      okText="Kaydet"
      cancelText="İptal"
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={submitForm}>
        <Form.Item name="title" label="Başlık" rules={[{ required: true, message: "Başlık gerekli" }]}>
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Açıklama">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="startDate" label="Başlangıç Tarihi" rules={[{ required: true }]}>
          <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="endDate" label="Bitiş Tarihi" rules={[{ required: true }]}>
          <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="document"
          label="Doküman"
          valuePropName="fileList"
          getValueFromEvent={normalizeUpload}
        >
          <Upload beforeUpload={() => false} maxCount={1}>
            <Button icon={<UploadOutlined />}>Dosya Seç</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  </div>
  );
};

export default Meetings;
