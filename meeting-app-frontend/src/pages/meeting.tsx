import React, { useEffect, useState } from "react";
import { Table, Button, message, Popconfirm, Modal, Form, Input, DatePicker, Upload } from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "../api/axios";
import dayjs from "dayjs";

const Meetings: React.FC = () => {
  const [meetings, setMeetings] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchMeetings = async () => {
    try {
      const res = await axios.get("/meetings");
      setMeetings(res.data);
    } catch {
      message.error("Toplantılar yüklenemedi");
    }
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

  const addMeeting = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description || "");
      formData.append("startDate", values.startDate.toISOString());
      formData.append("endDate", values.endDate.toISOString());

      if (values.document && values.document.file) {
        formData.append("document", values.document.file as Blob);
      }

      await axios.post("/meetings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Toplantı eklendi");
      setOpen(false);
      form.resetFields();
      fetchMeetings();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Ekleme hatası");
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Toplantılar</h2>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)} style={{ marginBottom: 16 }}>
        Toplantı Ekle
      </Button>

      <Table
        rowKey="id"
        dataSource={meetings}
        columns={[
          { title: "Başlık", dataIndex: "title" },
          { title: "Açıklama", dataIndex: "description" },
          {
            title: "Başlangıç",
            dataIndex: "startDate",
            render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm"),
          },
          {
            title: "Bitiş",
            dataIndex: "endDate",
            render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm"),
          },
          {
            title: "İşlemler",
            render: (_, record: any) => (
              <Popconfirm title="Silmek istediğine emin misin?" onConfirm={() => deleteMeeting(record.id)}>
                <Button danger>Sil</Button>
              </Popconfirm>
            ),
          },
        ]}
      />

      <Modal
        title="Toplantı Ekle"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form form={form} layout="vertical" onFinish={addMeeting}>
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
          <Form.Item name="document" label="Doküman">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Dosya Yükle</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Meetings;
