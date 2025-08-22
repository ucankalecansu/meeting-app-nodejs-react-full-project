import React from "react";
import { Form, Input, Button, Card, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      const res = await axios.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success(res.data.message);
      navigate("/login");
    } catch (err: any) {
      message.error(err.response?.data?.message || "Kayıt hatası");
    }
  };

  return (
    <Card title="Kayıt Ol" style={{ maxWidth: 400, margin: "50px auto" }}>
      <Form onFinish={onFinish}>
        <Form.Item name="firstName" rules={[{ required: true }]}>
          <Input placeholder="Ad" />
        </Form.Item>
        <Form.Item name="lastName" rules={[{ required: true }]}>
          <Input placeholder="Soyad" />
        </Form.Item>
        <Form.Item name="email" rules={[{ required: true, type: "email" }]}>
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item name="phone" rules={[{ required: true }]}>
          <Input placeholder="Telefon" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true }]}>
          <Input.Password placeholder="Şifre" />
        </Form.Item>
        <Form.Item name="profileImage">
          <Upload beforeUpload={() => false} maxCount={1}>
            <Button icon={<UploadOutlined />}>Profil Resmi Yükle</Button>
          </Upload>
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          Kayıt Ol
        </Button>
      </Form>
    </Card>
  );
};

export default Register;
