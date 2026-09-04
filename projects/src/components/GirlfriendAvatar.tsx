import { useId } from 'react';

interface GirlfriendAvatarProps {
  anger: number;
  /** 头像尺寸（px） */
  size?: number;
  /** 是否启用 3D 悬浮/倾斜动效（大头像建议开启，列表小头像建议关闭） */
  animated?: boolean;
  className?: string;
}

type Mood = 'love' | 'happy' | 'neutral' | 'annoyed' | 'pout' | 'angry' | 'furious';

/** 与 game-engine 的 emoji 档位保持一致 */
function moodFromAnger(anger: number): Mood {
  if (anger >= 90) return 'furious';
  if (anger >= 70) return 'angry';
  if (anger >= 50) return 'pout';
  if (anger >= 30) return 'annoyed';
  if (anger >= 15) return 'neutral';
  if (anger >= 5) return 'happy';
  return 'love';
}

const INK = '#5A3A33';

export default function GirlfriendAvatar({
  anger,
  size = 40,
  animated = false,
  className = '',
}: GirlfriendAvatarProps) {
  const mood = moodFromAnger(anger);
  const uid = useId().replace(/:/g, '');
  const g = (name: string) => `#${uid}-${name}`;

  const blushOpacity =
    mood === 'love' || mood === 'happy' || mood === 'pout' ? 0.95
    : mood === 'angry' ? 0.7
    : mood === 'annoyed' ? 0.65
    : mood === 'furious' ? 0.55
    : 0.45;

  return (
    <div
      className={`avatar-3d ${className}`}
      style={{ width: size, height: size }}
      aria-label={`女友头像（${mood}）`}
      role="img"
    >
      <div
        className={animated ? 'avatar-3d-inner' : undefined}
        style={{ width: '100%', height: '100%' }}
      >
        <svg viewBox="0 0 120 120" width="100%" height="100%" className="avatar-svg">
          <defs>
            <radialGradient id={`${uid}-orb`} cx="42%" cy="36%" r="75%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="38%" stopColor="#FFF4F7" />
              <stop offset="100%" stopColor="#FFD3DF" />
            </radialGradient>
            <radialGradient id={`${uid}-orbEdge`} cx="50%" cy="50%" r="50%">
              <stop offset="72%" stopColor="rgba(255,107,138,0)" />
              <stop offset="100%" stopColor="rgba(233,90,126,0.22)" />
            </radialGradient>
            <radialGradient id={`${uid}-skin`} cx="44%" cy="38%" r="72%">
              <stop offset="0%" stopColor="#FFF1E7" />
              <stop offset="62%" stopColor="#FFE0D0" />
              <stop offset="100%" stopColor="#F9CBB2" />
            </radialGradient>
            <linearGradient id={`${uid}-neck`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F6C6AF" />
              <stop offset="100%" stopColor="#EFB098" />
            </linearGradient>
            <linearGradient id={`${uid}-hair`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9C6344" />
              <stop offset="55%" stopColor="#7E4A30" />
              <stop offset="100%" stopColor="#5E3320" />
            </linearGradient>
            <linearGradient id={`${uid}-cloth`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF8FA9" />
              <stop offset="100%" stopColor="#EF5D87" />
            </linearGradient>
            <radialGradient id={`${uid}-blush`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF8BA0" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#FF8BA0" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${uid}-gloss`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <clipPath id={`${uid}-clip`}>
              <circle cx="60" cy="60" r="56" />
            </clipPath>
          </defs>

          <g clipPath={`url(${g('clip')})`}>
            {/* 3D 球型底盘（高光在上、边缘压暗） */}
            <circle cx="60" cy="60" r="56" fill={`url(${g('orb')})`} />
            <circle cx="60" cy="60" r="56" fill={`url(${g('orbEdge')})`} />

            {/* 后层头发（体积主体） */}
            <path
              d="M60 26 C41 26 29 43 29 65 C29 88 42 104 60 104 C78 104 91 88 91 65 C91 43 79 26 60 26 Z"
              fill={`url(${g('hair')})`}
            />

            {/* 脖子与肩（让角色更完整立体） */}
            <rect x="53" y="82" width="14" height="14" rx="6" fill={`url(${g('neck')})`} />
            <path
              d="M32 118 C36 100 47 92 60 92 C73 92 84 100 88 118 Z"
              fill={`url(${g('cloth')})`}
            />
            <path
              d="M52 95 Q60 102 68 95 L68 100 Q60 106 52 100 Z"
              fill="rgba(255,255,255,0.55)"
            />

            {/* 耳朵 */}
            <circle cx="35" cy="66" r="5" fill={`url(${g('skin')})`} />
            <circle cx="85" cy="66" r="5" fill={`url(${g('skin')})`} />

            {/* 脸（径向渐变营造球体体积） */}
            <ellipse cx="60" cy="62" rx="25" ry="27" fill={`url(${g('skin')})`} />
            {/* 脸部底部柔和阴影 + 刘海投影 */}
            <ellipse cx="60" cy="81" rx="19" ry="7" fill="rgba(224,140,110,0.16)" />
            <ellipse cx="60" cy="45" rx="23" ry="8" fill="rgba(120,70,40,0.10)" />

            {/* 腮红 */}
            <ellipse cx="44" cy="71" rx="6" ry="4" fill={`url(${g('blush')})`} opacity={blushOpacity} />
            <ellipse cx="76" cy="71" rx="6" ry="4" fill={`url(${g('blush')})`} opacity={blushOpacity} />

            {/* 暴怒时脸部涨红 */}
            {mood === 'furious' && (
              <ellipse cx="60" cy="64" rx="25" ry="26" fill="rgba(255,80,60,0.20)" />
            )}

            {/* ===== 五官（随怒气变化） ===== */}
            {/* 眉毛 */}
            {(mood === 'annoyed' || mood === 'pout' || mood === 'angry' || mood === 'furious') && (
              <g stroke={INK} strokeLinecap="round" fill="none">
                {mood === 'annoyed' && (
                  <>
                    <path d="M45 54 L55 55.5" strokeWidth="2.4" />
                    <path d="M75 54 L65 55.5" strokeWidth="2.4" />
                  </>
                )}
                {(mood === 'angry' || mood === 'furious') && (
                  <>
                    <path d="M44 53 L56 58.5" strokeWidth={mood === 'furious' ? 3.4 : 3} />
                    <path d="M76 53 L64 58.5" strokeWidth={mood === 'furious' ? 3.4 : 3} />
                  </>
                )}
                {mood === 'pout' && (
                  <>
                    <path d="M45 54.5 L55 56" strokeWidth="2.6" />
                    <path d="M75 54.5 L65 56" strokeWidth="2.6" />
                  </>
                )}
              </g>
            )}

            {/* 眼睛 */}
            {mood === 'love' && (
              <g fill="#FF4D6D">
                <path transform="translate(50,63) scale(0.95)" d="M0 3 C-1 1 -6 0 -6 -4 C-6 -8 -2 -9.5 0 -5.5 C2 -9.5 6 -8 6 -4 C6 0 1 1 0 3 Z" />
                <path transform="translate(70,63) scale(0.95)" d="M0 3 C-1 1 -6 0 -6 -4 C-6 -8 -2 -9.5 0 -5.5 C2 -9.5 6 -8 6 -4 C6 0 1 1 0 3 Z" />
              </g>
            )}
            {mood === 'happy' && (
              <g stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none">
                <path d="M45 63.5 Q50 57.5 55 63.5" />
                <path d="M65 63.5 Q70 57.5 75 63.5" />
              </g>
            )}
            {mood === 'neutral' && (
              <g fill="#4A3329">
                <circle cx="50" cy="62" r="3.2" />
                <circle cx="70" cy="62" r="3.2" />
                <circle cx="49" cy="61" r="1" fill="#fff" />
                <circle cx="69" cy="61" r="1" fill="#fff" />
              </g>
            )}
            {mood === 'annoyed' && (
              <g>
                <g fill="#4A3329">
                  <circle cx="50" cy="62.5" r="3.1" />
                  <circle cx="70" cy="62.5" r="3.1" />
                </g>
                <g stroke={INK} strokeWidth="2.4" strokeLinecap="round">
                  <path d="M45 59 L55 59" />
                  <path d="M65 59 L75 59" />
                </g>
              </g>
            )}
            {mood === 'pout' && (
              <g stroke={INK} strokeWidth="3" strokeLinecap="round">
                <path d="M46 60.5 L54 63.5" />
                <path d="M74 60.5 L66 63.5" />
              </g>
            )}
            {mood === 'angry' && (
              <g fill="#4A3329">
                <circle cx="50" cy="63" r="3.1" />
                <circle cx="70" cy="63" r="3.1" />
              </g>
            )}
            {mood === 'furious' && (
              <g stroke={INK} strokeWidth="3.2" strokeLinecap="round" fill="none">
                <path d="M45 60 L55 64" />
                <path d="M75 60 L65 64" />
                <path d="M55 60 L45 64" />
                <path d="M65 60 L75 64" />
              </g>
            )}

            {/* 嘴巴 */}
            {mood === 'love' && (
              <path d="M52 72 Q60 81 68 72 Q60 77 52 72 Z" fill="#B4455E" />
            )}
            {mood === 'happy' && (
              <path d="M53 72 Q60 78.5 67 72" stroke="#B45060" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            )}
            {mood === 'neutral' && (
              <path d="M55 74.5 L65 74.5" stroke="#8A5A4A" strokeWidth="2.6" strokeLinecap="round" />
            )}
            {mood === 'annoyed' && (
              <path d="M55 76.5 Q60 73 65 76.5" stroke="#8A5A4A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            )}
            {mood === 'pout' && (
              <circle cx="60" cy="75" r="2.6" fill="#B45060" />
            )}
            {mood === 'angry' && (
              <path d="M54 77.5 Q60 72 66 77.5" stroke="#B45060" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            )}
            {mood === 'furious' && (
              <g>
                <ellipse cx="60" cy="76" rx="5.6" ry="4.6" fill="#7A2E33" />
                <rect x="55.2" y="72.4" width="9.6" height="2" rx="1" fill="rgba(255,255,255,0.9)" />
              </g>
            )}

            {/* 前层刘海（覆盖额头，带高光） */}
            <path
              d="M35 62 C33 40 45 29 60 29 C75 29 87 40 85 62 C83 52 78 47 74 49 C72 43 65 42 62 46 C59 42 52 43 49 49 C45 47 39 52 35 62 Z"
              fill={`url(${g('hair')})`}
            />
            {/* 两侧发束 */}
            <path d="M35 58 C31 72 33 90 40 98 C35 86 33 72 37 60 Z" fill={`url(${g('hair')})`} />
            <path d="M85 58 C89 72 87 90 80 98 C85 86 87 72 83 60 Z" fill={`url(${g('hair')})`} />
            {/* 呆毛 */}
            <path d="M60 30 C58 22 63 17 68 16 C64 20 66 25 62 30 Z" fill={`url(${g('hair')})`} />
            {/* 头发高光：顶缘反光 + 刘海光泽 */}
            <path d="M39 40 C43 32 51 28 59 27" stroke="rgba(255,236,220,0.6)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M43 38 C49 32 59 30 65 32 C59 33 49 36 45 44 Z" fill="rgba(255,222,192,0.5)" />

            {/* ===== 情绪附加物 ===== */}
            {mood === 'love' && (
              <g fill="#FF7BA0">
                <path className="avatar-heart" transform="translate(31,37) scale(0.8)" d="M0 3 C-1 1 -6 0 -6 -4 C-6 -8 -2 -9.5 0 -5.5 C2 -9.5 6 -8 6 -4 C6 0 1 1 0 3 Z" />
                <path className="avatar-heart" style={{ animationDelay: '0.7s' }} transform="translate(90,33) scale(0.6)" d="M0 3 C-1 1 -6 0 -6 -4 C-6 -8 -2 -9.5 0 -5.5 C2 -9.5 6 -8 6 -4 C6 0 1 1 0 3 Z" />
              </g>
            )}
            {(mood === 'pout' || mood === 'furious') && (
              <g fill="#E7D7DC">
                <circle className="avatar-steam" cx="47" cy="20" r="3.2" opacity="0.85" />
                <circle className="avatar-steam" style={{ animationDelay: '0.4s' }} cx="54" cy="15" r="2.6" opacity="0.7" />
                <circle className="avatar-steam" style={{ animationDelay: '0.8s' }} cx="73" cy="15" r="2.6" opacity="0.7" />
                <circle className="avatar-steam" style={{ animationDelay: '1.1s' }} cx="66" cy="20" r="3.2" opacity="0.85" />
              </g>
            )}
            {mood === 'furious' && (
              <path
                className="avatar-anger"
                d="M89 23 L91 28.5 L96.5 26.5 L93 31.5 L97.5 35.5 L91.5 34.5 L89 40 L86.5 34.5 L80.5 35.5 L85 31.5 L81.5 26.5 L87 28.5 Z"
                fill="#FF3B30"
              />
            )}

            {/* 玻璃高光（左上方镜面反光，增强 3D 质感） */}
            <ellipse cx="40" cy="26" rx="26" ry="14" fill={`url(${g('gloss')})`} transform="rotate(-28 40 26)" />
          </g>

          {/* 外边框 */}
          <circle cx="60" cy="60" r="55.2" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.6" />
        </svg>
      </div>
    </div>
  );
}
