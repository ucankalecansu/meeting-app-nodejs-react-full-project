import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  Button,
  message,
  Popconfirm,
  Modal,
  Form,
  Input,
  DatePicker,
  Upload,
  Space,
  Tag,
  Select,
  Row,
  Col,
  Alert,
} from "antd";
import { UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "../api/axios";
import dayjs from "dayjs";

const normalizeUpload = (e: any) => (Array.isArray(e) ? e : e?.fileList);

const Meetings: React.FC = () => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [form] = Form.useForm();
  const participantsLoadedOnce = useRef(false);

  const fetchMeetings = async () => {
    try {
      const res = await axios.get("/meetings");
      setMeetings(res.data);
    } catch {
      message.error("Toplantılar yüklenemedi");
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // Modal açıldığında kullanıcıları çek (bir kez)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setParticipantsLoading(true);
        const res = await axios.get("/users");
        setUsers(res.data);
        participantsLoadedOnce.current = true;
      } catch {
        message.error("Katılımcı listesi yüklenemedi");
      } finally {
        setParticipantsLoading(false);
      }
    };
    if (open && !participantsLoadedOnce.current) fetchUsers();
  }, [open]);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: any) => {
    setEditingId(record.id);
    const participantArray =
      typeof record.participants === "string" && record.participants.length > 0
        ? record.participants.split(",").map((e: string) => e.trim())
        : [];
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      startDate: record.startDate ? dayjs(record.startDate) : undefined,
      endDate: record.endDate ? dayjs(record.endDate) : undefined,
      participants: participantArray,
      document: undefined,
    });
    setOpen(true);
  };

  const deleteMeeting = async (id: number) => {
    try {
      await axios.delete(`/meetings/${id}`);
      message.success("Toplantı silindi (katılımcılara mail gönderildi).");
      fetchMeetings();
    } catch {
      message.error("Silme hatası");
    }
  };

  const cancelMeeting = async () => {
    if (editingId == null) return;
    try {
      setCancelling(true);
      await axios.patch(`/meetings/${editingId}/cancel`);
      message.success("Toplantı iptal edildi (katılımcılara mail gönderildi).");
      setOpen(false);
      form.resetFields();
      fetchMeetings();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "İptal hatası");
    } finally {
      setCancelling(false);
    }
  };

  const submitForm = async (values: any) => {
    try {
      setSubmitting(true);

      // tarih doğrulaması
      if (values.startDate && values.endDate && values.endDate.isBefore(values.startDate)) {
        message.warning("Bitiş tarihi başlangıç tarihinden önce olamaz.");
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description || "");
      formData.append("startDate", values.startDate.toISOString());
      formData.append("endDate", values.endDate.toISOString());

      const emails = Array.isArray(values.participants)
        ? values.participants.join(",")
        : "";
      formData.append("participants", emails);

      const fileObj = values.document?.[0]?.originFileObj;
      if (fileObj) formData.append("document", fileObj);

      if (editingId == null) {
        await axios.post("/meetings", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Toplantı eklendi (katılımcılara mail gönderildi).");
      } else {
        await axios.put(`/meetings/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Toplantı güncellendi (katılımcılara mail gönderildi).");
      }

      setOpen(false);
      form.resetFields();
      fetchMeetings();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Kaydetme hatası");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: "Başlık", dataIndex: "title" as const, width: 150 },
    { title: "Açıklama", dataIndex: "description" as const, ellipsis: true, width: 200 },
    {
      title: "Başlangıç",
      dataIndex: "startDate" as const,
      render: (v: string) => (v ? dayjs(v).format("DD.MM.YYYY HH:mm") : "-"),
      width: 160,
    },
    {
      title: "Bitiş",
      dataIndex: "endDate" as const,
      render: (v: string) => (v ? dayjs(v).format("DD.MM.YYYY HH:mm") : "-"),
      width: 160,
    },
    {
      title: "Durum",
      dataIndex: "status" as const,
      render: (s: string) => <Tag color={s === "cancelled" ? "red" : "green"}>{s || "—"}</Tag>,
      width: 120,
    },
    {
      title: "Katılımcılar",
      dataIndex: "participants" as const,
      render: (p: string) =>
        p ? p.split(",").map((e) => <Tag key={e.trim()}>{e.trim()}</Tag>) : "—",
      width: 220,
    },
    {
      title: "İşlemler",
      render: (_: any, record: any) => (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} block>
            Düzenle
          </Button>
          <Popconfirm title="Silmek istediğine emin misin?" onConfirm={() => deleteMeeting(record.id)}>
            <Button danger icon={<DeleteOutlined />} block>
              Sil
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 120,
    },
  ];

  // Modal footer'ını özelleştiriyoruz: Kaydet, (varsa) İptal Et, Kapat
  const modalFooter = [
    editingId != null && (
      <Button key="cancelMeeting" danger loading={cancelling} onClick={cancelMeeting}>
        İptal Et
      </Button>
    ),
    <Button key="close" onClick={() => setOpen(false)}>
      Kapat
    </Button>,
    <Button key="save" type="primary" loading={submitting} onClick={() => form.submit()}>
      Kaydet
    </Button>,
  ].filter(Boolean);

  // Seçili katılımcı sayısını gösteren küçük yardımcı
  const selectedCount = (form.getFieldValue("participants") || []).length;

  return (
    <div style={{ padding: 20 }}>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>Toplantılar</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ marginTop: 8 }}>
          Toplantı Ekle
        </Button>
      </Space>

      <Table
        rowKey="id"
        dataSource={meetings}
        columns={columns}
        scroll={{ x: 900 }}
        pagination={{ pageSize: 5, responsive: true }}
      />

      <Modal
        title={editingId == null ? "Toplantı Ekle" : "Toplantıyı Düzenle"}
        open={open}
        onCancel={() => setOpen(false)}
        footer={modalFooter as any}
        destroyOnClose
        width="95%"
        style={{ maxWidth: 600 }}
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          message={
            editingId == null
              ? "Kaydettiğinizde seçili katılımcılara toplantı bilgilendirme e-postası gönderilir."
              : "Güncelleme sonrası katılımcılara e-posta ile değişiklik özeti gönderilir."
          }
        />
        <Form form={form} layout="vertical" onFinish={submitForm}>
          <Row gutter={[12, 12]}>
            <Col xs={24} md={12}>
              <Form.Item name="title" label="Başlık" rules={[{ required: true, message: "Başlık gerekli" }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="description" label="Açıklama">
                <Input.TextArea rows={1} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="startDate" label="Başlangıç Tarihi" rules={[{ required: true }]}>
                <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="endDate"
                label="Bitiş Tarihi"
                dependencies={["startDate"]}
                rules={[
                  { required: true, message: "Bitiş tarihi gerekli" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const start = getFieldValue("startDate");
                      if (!value || !start || !value.isBefore(start)) return Promise.resolve();
                      return Promise.reject(new Error("Bitiş tarihi başlangıçtan önce olamaz"));
                    },
                  }),
                ]}
              >
                <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="participants" label={`Katılımcılar (email) ${selectedCount ? `• ${selectedCount} kişi` : ""}`}>
                <Select
                  mode="multiple"
                  showSearch
                  placeholder={participantsLoading ? "Katılımcılar yükleniyor..." : "Kullanıcı seç"}
                  loading={participantsLoading}
                  optionFilterProp="label"
                  options={users.map((u) => ({
                    label: `${u.firstName} ${u.lastName} — ${u.email}${u.phone ? " — " + u.phone : ""}`,
                    value: u.email,
                  }))}
                />
              </Form.Item>
            </Col>
            {/* <Col xs={24}>
              <Form.Item name="document" label="Doküman" valuePropName="fileList" getValueFromEvent={normalizeUpload}>
                <Upload beforeUpload={() => false} maxCount={1}>
                  <Button icon={<UploadOutlined />}>Dosya Seç</Button>
                </Upload>
              </Form.Item>
            </Col> */}
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Meetings;
