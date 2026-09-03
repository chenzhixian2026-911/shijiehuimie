import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getSupabaseClient } from "./src/storage/database/db-client";

const router = Router();

// 注册
router.post("/register", async (req: Request, res: Response) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			return res.status(400).json({ error: "用户名和密码不能为空" });
		}

		if (username.length < 2 || username.length > 20) {
			return res.status(400).json({ error: "用户名长度需在 2-20 个字符之间" });
		}

		if (password.length < 6) {
			return res.status(400).json({ error: "密码长度不能少于 6 个字符" });
		}

		// 检查用户名是否已存在
		const { data: existingUser } = await getSupabaseClient()
			.from("users")
			.select("id")
			.eq("username", username)
			.single();

		if (existingUser) {
			return res.status(409).json({ error: "用户名已存在" });
		}

		// 密码哈希加密
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// 创建用户
		const { data: user, error } = await getSupabaseClient()
			.from("users")
			.insert({
				username,
				password: hashedPassword,
			})
			.select("id, username, created_at")
			.single();

		if (error) {
			console.error("Create user error:", error);
			return res.status(500).json({ error: "注册失败" });
		}

		// 返回用户信息（不包含密码）
		res.json({
			success: true,
			user: {
				id: user.id,
				username: user.username,
				created_at: user.created_at,
			},
		});
	} catch (error) {
		console.error("Register error:", error);
		res.status(500).json({ error: "注册失败" });
	}
});

// 登录
router.post("/login", async (req: Request, res: Response) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			return res.status(400).json({ error: "用户名和密码不能为空" });
		}

		// 查找用户
		const { data: user, error } = await getSupabaseClient()
			.from("users")
			.select("id, username, password, created_at")
			.eq("username", username)
			.single();

		if (error || !user) {
			return res.status(401).json({ error: "用户名或密码错误" });
		}

		// 验证密码
		const isValid = await bcrypt.compare(password, user.password);

		if (!isValid) {
			return res.status(401).json({ error: "用户名或密码错误" });
		}

		// 返回用户信息（不包含密码）
		res.json({
			success: true,
			user: {
				id: user.id,
				username: user.username,
				created_at: user.created_at,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "登录失败" });
	}
});

// 获取当前用户信息（通过 username 查询）
router.get("/me/:username", async (req: Request, res: Response) => {
	try {
		const { username } = req.params;

		const { data: user, error } = await getSupabaseClient()
			.from("users")
			.select("id, username, created_at")
			.eq("username", username)
			.single();

		if (error || !user) {
			return res.status(404).json({ error: "用户不存在" });
		}

		res.json({ user });
	} catch (error) {
		console.error("Get user error:", error);
		res.status(500).json({ error: "获取用户信息失败" });
	}
});

export default router;
