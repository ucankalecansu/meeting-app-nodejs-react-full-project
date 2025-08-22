import React from "react";
import { Form, Input, Button, Card, message } from "antd";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const res = await axios.post("/auth/login", values);
      localStorage.setItem("token", res.data.token);
      message.success("Giriş başarılı!");
      navigate("/meetings");
    } catch (err: any) {
      message.error(err.response?.data?.message || "Giriş hatası");
    }
  };

  return (
    <Card title="Giriş Yap" style={{ maxWidth: 400, margin: "50px auto" }}>
      <Form onFinish={onFinish}>
        <Form.Item name="email" rules={[{ required: true, message: "Email gerekli" }]}>
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: "Şifre gerekli" }]}>
          <Input.Password placeholder="Şifre" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          Giriş
        </Button>
      </Form>

      {/* 👇 Altına Kayıt Ol linki ekledik */}
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <span>Hesabın yok mu? </span>
        <Link to="/register">Kayıt Ol</Link>
      </div>
    </Card>
  );
};

export default Login;
