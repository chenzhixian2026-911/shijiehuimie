import { useState } from "react";

interface LoginPageProps {
	onLogin: (user: { id: number; username: string }) => void;
	onSwitchToRegister: () => void;
}

export default function LoginPage({ onLogin, onSwitchToRegister }: LoginPageProps) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || "登录失败");
				return;
			}

			// 保存登录状态
			localStorage.setItem("user", JSON.stringify(data.user));
			onLogin(data.user);
		} catch {
			setError("网络错误，请稍后重试");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-bg)" }}>
			<div className="w-full max-w-md">
				{/* Logo */}
				<div className="text-center mb-8">
					<div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-coral))" }}>
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
							<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
						</svg>
					</div>
					<h1 className="text-3xl font-bold" style={{ color: "var(--color-text)" }}>
						欢迎回来
					</h1>
					<p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
						登录你的哄哄模拟器账号
					</p>
				</div>

				{/* Form */}
				<div className="auth-card">
					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label className="auth-label">用户名</label>
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="auth-input"
								placeholder="请输入用户名"
								required
								minLength={2}
								maxLength={20}
							/>
						</div>

						<div>
							<label className="auth-label">密码</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="auth-input"
								placeholder="请输入密码"
								required
								minLength={6}
							/>
						</div>

						{error && (
							<div className="auth-error">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="auth-button-primary"
						>
							{loading ? "登录中..." : "登录"}
						</button>
					</form>

					<div className="auth-switch">
						还没有账号？{" "}
						<button onClick={onSwitchToRegister} className="auth-link">
							立即注册
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
