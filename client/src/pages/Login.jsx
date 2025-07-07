import { Button, Divider, Form, Input } from "antd";
import { useLoginUserMutation } from "../context/services/user.service";
import { notification } from "antd";

const Login = () => {
  const [form] = Form.useForm();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  async function handleLogin(values) {
    try {
      const res = await loginUser(values).unwrap();
      console.log(res);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      notification.success({
        message: "Muvaffaqiyatli",
        description: "Siz tizimga muvaffaqiyatli kirdingiz",
      });
      window.location.href = "/";
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Xatolik",
        description: err.data.message,
      });
    }
  }
  return (
    <div className="login">
      <Form
        onFinish={handleLogin}
        autoComplete="off"
        style={{
          width: "300px",
          paddingInline: "15px",
          paddingBlock: "15px",
          border: "1px solid #ccc",
          borderRadius: "15px",
        }}
        form={form}
        layout="vertical"
      >
        <h2>Hisobga kirish</h2>
        <Divider />
        <Form.Item
          name="phone"
          rules={[
            { required: true, message: "Telefon raqamni kiriting" },
            { min: 9, message: "Minimal belgilar sonidan kam kiritdingiz" },
          ]}
        >
          <Input placeholder="Telefon raqam" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Parolni kiriting" }]}
        >
          <Input.Password placeholder="Parol" />
        </Form.Item>
        <Divider />
        <Form.Item>
          <Button
            loading={isLoading}
            htmlType="submit"
            style={{ width: "100%" }}
            type="primary"
          >
            Kirish
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
