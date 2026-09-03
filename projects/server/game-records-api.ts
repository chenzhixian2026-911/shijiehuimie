import { Router, Request, Response } from 'express';
import { getSupabaseClient } from './src/storage/database/db-client';

export const gameRecordsRouter = Router();

// 保存游戏记录
gameRecordsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { user_id, scenario, final_score, result } = req.body;

    if (!user_id || !scenario || final_score === undefined || !result) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    if (!['win', 'lose'].includes(result)) {
      return res.status(400).json({ error: 'result 必须是 win 或 lose' });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('game_records')
      .insert({
        user_id,
        scenario,
        final_score,
        result,
      })
      .select()
      .single();

    if (error) {
      console.error('保存游戏记录失败:', error);
      return res.status(500).json({ error: '保存游戏记录失败' });
    }

    res.json({ success: true, record: data });
  } catch (err) {
    console.error('保存游戏记录异常:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取用户游戏记录列表
gameRecordsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { user_id, limit = 20 } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: '缺少 user_id 参数' });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('game_records')
      .select('*')
      .eq('user_id', Number(user_id))
      .order('played_at', { ascending: false })
      .limit(Number(limit));

    if (error) {
      console.error('获取游戏记录失败:', error);
      return res.status(500).json({ error: '获取游戏记录失败' });
    }

    res.json({ records: data || [] });
  } catch (err) {
    console.error('获取游戏记录异常:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取用户游戏统计
gameRecordsRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: '缺少 user_id 参数' });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('game_records')
      .select('result, final_score')
      .eq('user_id', Number(user_id));

    if (error) {
      console.error('获取游戏统计失败:', error);
      return res.status(500).json({ error: '获取游戏统计失败' });
    }

    const records = data || [];
    const totalGames = records.length;
    const winGames = records.filter(r => r.result === 'win').length;
    const avgScore = totalGames > 0
      ? Math.round(records.reduce((sum, r) => sum + r.final_score, 0) / totalGames)
      : 0;

    res.json({
      totalGames,
      winGames,
      loseGames: totalGames - winGames,
      winRate: totalGames > 0 ? Math.round((winGames / totalGames) * 100) : 0,
      avgScore,
    });
  } catch (err) {
    console.error('获取游戏统计异常:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取排行榜（按最高分数排名，前20名）
gameRecordsRouter.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient();

    // 先获取所有游戏记录，按分数降序
    const { data: records, error: recordsError } = await supabase
      .from('game_records')
      .select('user_id, final_score, played_at')
      .order('final_score', { ascending: false });

    if (recordsError) {
      console.error('获取排行榜失败:', recordsError);
      return res.status(500).json({ error: '获取排行榜失败' });
    }

    if (!records || records.length === 0) {
      return res.json({ leaderboard: [] });
    }

    // 按用户分组，取每个用户的最高分数
    const userBestScores = new Map<number, { final_score: number; played_at: string }>();
    for (const record of records) {
      if (!userBestScores.has(record.user_id)) {
        userBestScores.set(record.user_id, {
          final_score: record.final_score,
          played_at: record.played_at,
        });
      }
    }

    // 转换为数组并排序
    const leaderboard = Array.from(userBestScores.entries())
      .map(([userId, data]) => ({
        user_id: userId,
        final_score: data.final_score,
        played_at: data.played_at,
      }))
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, 20);

    // 获取用户信息
    const userIds = leaderboard.map(item => item.user_id);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username')
      .in('id', userIds);

    if (usersError) {
      console.error('获取用户信息失败:', usersError);
      return res.status(500).json({ error: '获取用户信息失败' });
    }

    // 合并用户信息
    const userMap = new Map((users || []).map(u => [u.id, u.username]));
    const result = leaderboard.map((item, index) => ({
      rank: index + 1,
      user_id: item.user_id,
      username: userMap.get(item.user_id) || '未知用户',
      final_score: item.final_score,
      played_at: item.played_at,
    }));

    res.json({ leaderboard: result });
  } catch (err) {
    console.error('获取排行榜异常:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});
