import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth/auth';
import { apiFetch } from '../api/api';
import {
    Button,
    Modal,
    Input,
    DatePicker,
    Select,
    List,
    Space,
    message,
    Card,
    Typography,
    Form,
    Dropdown,
    Menu
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const TeacherDashboard = () => {
    const { token, user, logout } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(null);

    const [submissionsModalVisible, setSubmissionsModalVisible] = useState(false);
    const [currentSubmissions, setCurrentSubmissions] = useState([]);
    const [currentAssignmentTitle, setCurrentAssignmentTitle] = useState('');

    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const load = useCallback(async () => {
        const q = statusFilter
            ? `?status=${statusFilter}&page=${page}&limit=20`
            : `?page=${page}&limit=20`;

        const res = await apiFetch(token, '/api/assignments' + q);
        setAssignments(res.items || []);
    }, [statusFilter, page, token]);

    useEffect(() => {
        load();
    }, [load]);

    const openCreateModal = () => {
        setTitle('');
        setDescription('');
        setDueDate(null);
        setEditMode(false);
        setCurrentId(null);
        setIsModalVisible(true);
    };

    const openEditModal = (assignment) => {
        setTitle(assignment.title);
        setDescription(assignment.description || '');
        setDueDate(moment(assignment.dueDate));
        setEditMode(true);
        setCurrentId(assignment.id);
        setIsModalVisible(true);
    };

    const saveAssignment = async () => {
        if (!title || !dueDate) {
            message.error('Title and Due Date are required');
            return;
        }

        if (editMode && currentId) {
            await apiFetch(token, `/api/assignments/${currentId}`, {
                method: 'PUT',
                body: {
                    title,
                    description,
                    dueDate: dueDate.toISOString()
                }
            });
            message.success('Assignment updated!');
        } else {
            await apiFetch(token, '/api/assignments', {
                method: 'POST',
                body: {
                    title,
                    description,
                    dueDate: dueDate.toISOString()
                }
            });
            message.success('Assignment created!');
        }

        setTitle('');
        setDescription('');
        setDueDate(null);
        setIsModalVisible(false);
        load();
    };

    const publish = async (id) => {
        await apiFetch(token, `/api/assignments/${id}/publish`, { method: 'POST' });
        load();
    }
    const complete = async (id) => {
        await apiFetch(token, `/api/assignments/${id}/complete`, { method: 'POST' });
        load();
    }

    const remove = async (id) => {
        try {
            setAssignments(prev => prev.filter(a => a.id !== id));
            await apiFetch(token, `/api/assignments/${id}`, { method: 'DELETE' });
            message.success('Assignment deleted');
            load();
        } catch (err) {
            message.error('Failed to delete assignment');
            load();
        }
    };


    const viewSubmissions = async (id, title) => {
        try {
            const res = await apiFetch(token, `/api/assignments/${id}/submissions`);
            setCurrentSubmissions(res || []);
            setCurrentAssignmentTitle(title);
            setSubmissionsModalVisible(true);
        } catch (e) {
            message.error('Failed to fetch submissions');
        }
    };

    const markReviewed = async (assignmentId, studentId, note) => {
        try {
            await apiFetch(token, `/api/assignments/${assignmentId}/submissions/${studentId}/review`, {
                method: 'POST',
                body: { reviewNote: note || '' }
            });
            message.success('Marked as reviewed');
            setCurrentSubmissions(prev =>
                prev.map(s =>
                    s.id === studentId ? { ...s, reviewed: true, reviewNote: note } : s
                )
            );
        } catch (e) {
            message.error('Failed to mark as reviewed');
        }
    }

    const openDetailsModal = (assignment) => {
        setSelectedAssignment(assignment);
        setDetailsModalVisible(true);
    };

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>Teacher Dashboard - {user?.name}</h2>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <Space>
                    <Button type="primary" onClick={openCreateModal}>Create Assignment</Button>
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: 150 }}
                        placeholder="Filter Status"
                    >
                        <Option value="">All</Option>
                        <Option value="DRAFT">Draft</Option>
                        <Option value="PUBLISHED">Published</Option>
                        <Option value="COMPLETED">Completed</Option>
                    </Select>
                </Space>
            </div>

            <Modal
                title={editMode ? "Edit Assignment" : "Create Assignment"}
                open={isModalVisible}
                onOk={saveAssignment}
                onCancel={() => setIsModalVisible(false)}
                okText={editMode ? "Update" : "Create"}
            >
                <Input
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    style={{ marginBottom: 10 }}
                />
                <TextArea
                    placeholder="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    style={{ marginBottom: 10 }}
                />
                <DatePicker
                    showTime
                    style={{ width: '100%' }}
                    value={dueDate}
                    onChange={setDueDate}
                />
            </Modal>

            <Modal
                title={`Submissions - ${currentAssignmentTitle}`}
                open={submissionsModalVisible}
                onCancel={() => setSubmissionsModalVisible(false)}
                footer={null}
                width={700}
            >
                {currentSubmissions.length === 0 ? (
                    <Text>No submissions yet</Text>
                ) : (
                    <List
                        dataSource={currentSubmissions}
                        renderItem={s => (
                            <List.Item>
                                <Card style={{ width: '100%' }}>
                                    <Text strong>{s.student?.name || s.studentId}</Text>
                                    <br />
                                    <Text>{s.answer}</Text>
                                    <br />
                                    <Text type="secondary">Submitted at: {moment(s.submittedAt).format('YYYY-MM-DD HH:mm')}</Text>
                                    <br />
                                    <Text>Status: {s.reviewed ? 'Reviewed' : 'Pending'}</Text>
                                    <br />
                                    {!s.reviewed && (
                                        <Form
                                            layout="inline"
                                            onFinish={(values) => markReviewed(s.assignmentId, s.studentId, values.note)}
                                        >
                                            <Form.Item name="note">
                                                <Input placeholder="Review note (optional)" />
                                            </Form.Item>
                                            <Form.Item>
                                                <Button type="primary" htmlType="submit">Mark Reviewed</Button>
                                            </Form.Item>
                                        </Form>
                                    )}
                                    {s.reviewed && s.reviewNote && (
                                        <Text type="secondary">Note: {s.reviewNote}</Text>
                                    )}
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </Modal>

            <Modal
                title="Assignment Details"
                open={detailsModalVisible}
                onCancel={() => setDetailsModalVisible(false)}
                footer={null}
            >
                {selectedAssignment && (
                    <div>
                        <p><strong>Title:</strong> {selectedAssignment.title}</p>
                        <p><strong>Description:</strong> {selectedAssignment.description || "No description"}</p>
                        <p><strong>Status:</strong> {selectedAssignment.status}</p>
                        <p><strong>Due Date:</strong> {moment(selectedAssignment.dueDate).format('YYYY-MM-DD HH:mm')}</p>
                    </div>
                )}
            </Modal>

            <List
                bordered
                dataSource={assignments}
                renderItem={a => (
                    <List.Item
                        key={a.id}  // important for React re-render
                        actions={[
                            a.status === 'DRAFT' && (
                                <Dropdown
                                    overlay={
                                        <Menu
                                            onClick={({ key }) => {
                                                if (key === 'edit') openEditModal(a);
                                                if (key === 'delete') remove(a.id);
                                            }}
                                            items={[
                                                { label: 'Edit', key: 'edit' },
                                                { label: 'Delete', key: 'delete', danger: true }
                                            ]}
                                        />
                                    }
                                    trigger={['click']}
                                >
                                    <Button>
                                        Actions <DownOutlined />
                                    </Button>
                                </Dropdown>

                            ),
                            a.status === 'DRAFT' && (
                                <Button onClick={() => publish(a.id)} type="primary">Publish</Button>
                            ),
                            a.status === 'PUBLISHED' && (
                                <Button onClick={() => complete(a.id)}>Mark Completed</Button>
                            ),
                            a.status === 'PUBLISHED' && (
                                <Button onClick={() => viewSubmissions(a.id, a.title)}>View Submissions</Button>
                            )
                        ].filter(Boolean)}
                    >
                        <List.Item.Meta
                            title={
                                <a onClick={() => openDetailsModal(a)} style={{ cursor: 'pointer' }}>
                                    {a.title}
                                </a>
                            }
                            description={`Status: ${a.status} | Due: ${moment(a.dueDate).format('YYYY-MM-DD HH:mm')}`}
                        />
                    </List.Item>
                )}
            />

        </div>
    );
};

export default TeacherDashboard;
