import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth/auth';
import { apiFetch } from '../api/api';
import { Button, List, Card, Typography, Space, Input, message, Modal } from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;

 const StudentDashboard = () => {
    const { token, user, logout } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [selected, setSelected] = useState(null);
    const [answer, setAnswer] = useState('');
    const [mySubmission, setMySubmission] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const load = useCallback(async () => {
        const res = await apiFetch(token, '/api/assignments/published/list?page=1&limit=50');
        setAssignments(res.items || []);
    }, [token]);

    useEffect(() => {
        load();
    }, [load]);


    const fetchDetail = async (id) => {
        const res = await apiFetch(token, `/api/assignments/${id}`);
        setSelected(res.assignment);
        setMySubmission(res.mySubmission || null);
    }

    const submit = async (id) => {
        if (!answer.trim()) {
            message.error('Answer cannot be empty');
            return;
        }
        setLoading(true);
        try {
            await apiFetch(token, `/api/assignments/${id}/submissions`, { method: 'POST', body: { answer } });
            setAnswer('');
            fetchDetail(id);
            message.success('Submission successful!');
        } catch (e) {
            message.error(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={2}>Student Dashboard - {user?.name}</Title>
                <Button type="primary" danger onClick={() => setIsModalOpen(true)}>Logout</Button>
                <Modal
                    title="Confirm Logout"
                    open={isModalOpen}
                    onOk={() => {
                        logout();
                        message.success('Logged out successfully');
                        setIsModalOpen(false);
                    }}
                    onCancel={() => setIsModalOpen(false)}
                    okText="Logout"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                >
                    <p>Are you sure you want to logout?</p>
                </Modal>
            </div>

            <Title level={3}>Published Assignments</Title>
            <List
                bordered
                dataSource={assignments}
                renderItem={a => (
                    <List.Item
                        actions={[
                            <Button type="link" onClick={() => fetchDetail(a.id)}>Open</Button>
                        ]}
                    >
                        <Text strong>{a.title}</Text> - <Text type="secondary">Due: {new Date(a.dueDate).toLocaleString()}</Text>
                    </List.Item>
                )}
            />

            {selected && (
                <Card title={selected.title} style={{ marginTop: 20 }} bordered>
                    <Text>{selected.description}</Text>
                    <br />
                    <Text type="secondary">Due: {new Date(selected.dueDate).toLocaleString()}</Text>

                    {mySubmission ? (
                        <Card type="inner" title="Your Submission" style={{ marginTop: 20 }}>
                            <Text>{mySubmission.answer}</Text>
                            <br />
                            <Text type="secondary">Submitted at: {new Date(mySubmission.submittedAt).toLocaleString()}</Text>
                        </Card>
                    ) : (
                        <div style={{ marginTop: 20 }}>
                            <TextArea
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                rows={6}
                                placeholder="Type your answer..."
                                style={{ marginBottom: 10 }}
                            />
                            <br />
                            <Button type="primary" onClick={() => submit(selected.id)} loading={loading}>
                                Submit
                            </Button>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}

export default StudentDashboard;
