import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth/auth';
import { apiFetch } from '../api/api';
import {
    Button,
    List,
    Card,
    Typography,
    Input,
    message,
    Modal,
    Tabs,
    Dropdown,
    Menu,
    Avatar
} from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const StudentDashboard = () => {
    const { token, user, logout } = useAuth();
    const [publishedAssignments, setPublishedAssignments] = useState([]);
    const [reviewedAssignments, setReviewedAssignments] = useState([]);
    const [selected, setSelected] = useState(null);
    const [answer, setAnswer] = useState('');
    const [mySubmission, setMySubmission] = useState(null);
    const [loading, setLoading] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('1');

    const loadPublished = useCallback(async () => {
        try {
            const res = await apiFetch(token, '/api/assignments/published/list?page=1&limit=50');
            setPublishedAssignments(res.items || []);
        } catch (err) {
            message.error('Failed to load published assignments');
        }
    }, [token]);

    const loadReviewed = useCallback(async () => {
        try {
            const res = await apiFetch(token, '/api/assignments/getReviewedAssignments');
            setReviewedAssignments((res || []).filter(sub => sub.reviewed));
        } catch (err) {
            message.error('Failed to load reviewed assignments');
        }
    }, [token]);

    useEffect(() => {
        loadPublished();
        loadReviewed();
    }, [loadPublished, loadReviewed]);

    const fetchDetail = async (id) => {
        try {
            const res = await apiFetch(token, `/api/assignments/${id}`);
            setSelected(res.assignment);
            setMySubmission(res.mySubmission || null);
        } catch (err) {
            message.error('Failed to fetch assignment details');
        }
    };

    const submit = async (id) => {
        if (!answer.trim()) {
            message.error('Answer cannot be empty');
            return;
        }
        setLoading(true);
        try {
            await apiFetch(token, `/api/assignments/${id}/submissions`, {
                method: 'POST',
                body: { answer }
            });
            setAnswer('');
            await fetchDetail(id);
            await loadPublished();
            await loadReviewed();
            message.success('Submission successful!');
        } catch (e) {
            message.error(e.message || 'Failed to submit');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title
                    level={2}
                    style={{
                        color: '#0c0d0eff',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                        marginBottom: '20px',
                        fontWeight: 500,
                        letterSpacing: '1px',
                    }}
                >
                    Student Dashboard
                </Title>

                <Dropdown
                    overlay={
                        <Menu
                            items={[
                                {
                                    key: 'logout',
                                    label: 'Logout',
                                    onClick: () => setLogoutModalVisible(true),
                                    danger: true
                                }
                            ]}
                        />
                    }
                    placement="bottomRight"
                >
                    <div style={{ textAlign: 'center', cursor: 'pointer' }}>
                        <Avatar size={48} icon={<UserOutlined />} />
                        <div style={{ marginTop: 5, fontWeight: 500 }}>{user?.name}</div>
                    </div>
                </Dropdown>
            </div>

            <Modal
                title="Confirm Logout"
                open={logoutModalVisible}
                onOk={() => {
                    logout();
                    message.success('Logged out successfully');
                    setLogoutModalVisible(false);
                }}
                onCancel={() => setLogoutModalVisible(false)}
                okText="Logout"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to logout?</p>
            </Modal>

            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Published Assignments" key="1">
                    <List
                        bordered
                        dataSource={publishedAssignments}
                        renderItem={a => (
                            <List.Item actions={[<Button type="link" onClick={() => fetchDetail(a.id)}>Open</Button>]}>
                                <Text strong>{a.title}</Text> - <Text type="secondary">Due: {new Date(a.dueDate).toLocaleString()}</Text>
                            </List.Item>
                        )}
                    />

                    {activeTab === '1' && selected && (
                        <Card title={selected.title} style={{ marginTop: 20 }} bordered>
                            <Text>{selected.description}</Text>
                            <br />
                            <Text type="secondary">Due: {new Date(selected.dueDate).toLocaleString()}</Text>

                            {mySubmission ? (
                                <Card type="inner" title="Your Submission" style={{ marginTop: 20 }}>
                                    <Text>{mySubmission.answer}</Text>
                                    <br />
                                    <Text type="secondary">Submitted at: {new Date(mySubmission.submittedAt).toLocaleString()}</Text>
                                    {mySubmission.reviewed && (
                                        <>
                                            <br />
                                            <Text type="success">Reviewed</Text>
                                            {mySubmission.reviewNote && (
                                                <>
                                                    <br />
                                                    <Text type="secondary">Note: {mySubmission.reviewNote}</Text>
                                                </>
                                            )}
                                        </>
                                    )}
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
                </TabPane>

                <TabPane tab="Reviewed Assignments" key="2">
                    {reviewedAssignments.length === 0 ? (
                        <Text>No reviewed assignments yet</Text>
                    ) : (
                        <List
                            bordered
                            dataSource={reviewedAssignments}
                            renderItem={(r) => (
                                <List.Item>
                                    <Card style={{ width: '100%' }}>
                                        <Text strong>{r.assignment.title}</Text>
                                        <br />
                                        <Text>{r.assignment.description}</Text>
                                        <br />
                                        <Text type="secondary">Due: {new Date(r.assignment.dueDate).toLocaleString()}</Text>
                                        <br />
                                        <Text>Reviewed: {r.reviewNote}</Text>
                                        <br />
                                        <Text type="secondary">Submitted at: {new Date(r.submittedAt).toLocaleString()}</Text>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    )}
                </TabPane>
            </Tabs>
        </div>
    );
};

export default StudentDashboard;
