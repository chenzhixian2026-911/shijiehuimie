import { useState } from "react";

interface RegisterPageProps {
	onRegister: (user: { id: number; username: string }) => void;
	onSwitchToLogin: () => void;
}

export default function RegisterPage({ onRegister, onSwitchToLogin }: RegisterPageProps) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (password !== confirmPassword) {
			setError("两次输入的密码不一致");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || "注册失败");
				return;
			}

			// 注册成功，自动登录
			localStorage.setItem("user", JSON.stringify(data.user));
			onRegister(data.user);
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
						创建账号
					</h1>
					<p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
						注册一个哄哄模拟器账号
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
								placeholder="2-20个字符"
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
								placeholder="至少6个字符"
								required
								minLength={6}
							/>
						</div>

						<div>
							<label className="auth-label">确认密码</label>
							<input
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="auth-input"
								placeholder="再次输入密码"
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
							{loading ? "注册中..." : "注册"}
						</button>
					</form>

					<div className="auth-switch">
						已有账号？{" "}
						<button onClick={onSwitchToLogin} className="auth-link">
							立即登录
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
