import React, { useEffect, useState } from "react";
import { Table, Button, message, Popconfirm } from "antd";
import axios from "../api/axios";

const Meetings: React.FC = () => {
  const [meetings, setMeetings] = useState([]);

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

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Toplantılar</h2>
      <Table
        rowKey="id"
        dataSource={meetings}
        columns={[
          { title: "Başlık", dataIndex: "title" },
          { title: "Açıklama", dataIndex: "description" },
          { title: "Başlangıç", dataIndex: "startDate" },
          { title: "Bitiş", dataIndex: "endDate" },
          {
            title: "İşlemler",
            render: (_, record: any) => (
              <Popconfirm
                title="Silmek istediğine emin misin?"
                onConfirm={() => deleteMeeting(record.id)}
              >
                <Button danger>Sil</Button>
              </Popconfirm>
            ),
          },
        ]}
      />
    </div>
  );
};

export default Meetings;
