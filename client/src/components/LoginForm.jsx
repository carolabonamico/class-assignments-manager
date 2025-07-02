import { useActionState } from "react";
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';

function LoginForm({ handleLogin }) {
    const [state, formAction, isPending] = useActionState(loginFunction, { username: '', password: '' });

    async function loginFunction(prevState, formData) {
        const credentials = {
            username: formData.get('username'),
            password: formData.get('password'),
        };

        try {
            await handleLogin(credentials);
            return { success: true };
        } catch {
            return { error: 'Email o password errate, riprovare.' };
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="app-logo">
                        <i className="bi bi-journal-check" style={{ fontSize: '3rem', color: 'var(--primary-blue)' }}></i>
                    </div>
                    <h2 className="app-title">Sistema Gestione Compiti</h2>
                </div>

                {isPending && <Alert variant="warning">Attendere la risposta del server...</Alert>}
                {state.error && <Alert variant="danger">{state.error}</Alert>}
                
                <Row className="justify-content-center">
                    <Col md={12}>
                        <Form action={formAction}>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="email"
                                    name="username"
                                    required
                                    placeholder="Email"
                                    className="login-input"
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Control
                                    type="password"
                                    name="password"
                                    required
                                    minLength={8}
                                    placeholder="Password"
                                    className="login-input"
                                />
                            </Form.Group>

                            <div className="d-grid mb-4">
                                <Button 
                                    type="submit" 
                                    size="lg"
                                    disabled={isPending}
                                    className="login-button"
                                >
                                    {isPending ? 'Accesso in corso...' : 'Accedi'}
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default LoginForm;
