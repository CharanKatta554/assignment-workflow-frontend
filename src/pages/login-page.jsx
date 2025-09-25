import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth';
import { apiFetch } from '../api/api';
import { Form, Input, Button, Typography, Alert, Space } from 'antd';

const { Title, Text } = Typography;

export default function LoginPage() {
    const [err, setErr] = useState('');
    const auth = useAuth();
    const nav = useNavigate();

    const [loading, setLoading] = useState(false);

    const submit = async (values) => {
        const { username, password } = values;
        setErr('');
        setLoading(true);
        try {
            const res = await apiFetch(null, '/api/auth/login', {
                method: 'POST',
                body: { username, password }
            });
            auth.login(res);
            if (res.role === 'TEACHER') nav('/teacher');
            else nav('/student');
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #f0f0f0', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Title level={2} style={{ textAlign: 'center' }}>Login</Title>

            {err && <Alert message={err} type="error" showIcon style={{ marginBottom: 20 }} />}

            <Form
                layout="vertical"
                onFinish={submit}
                initialValues={{ username: '', password: '' }}
            >
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please enter your username!' }]}
                >
                    <Input placeholder="Enter username" />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please enter your password!' }]}
                >
                    <Input.Password placeholder="Enter password" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        Login
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
