'use client';

import React from 'react';
import { Block, Icon, Pill, Section } from '../pb-site/primitives';

type BubbleTone = 'butter' | 'mint' | 'coral' | 'grape';
type Msg = {
  who: string;
  tone: BubbleTone;
  text?: string;
  time: string;
  me?: boolean;
  attach?: { title: string; kind: string };
};

const MESSAGES: Msg[] = [
  { who: 'Kai', tone: 'mint', text: 'how do you do the floaty jump on level 3?? 😭', time: '3:21' },
  { who: 'Ava', tone: 'butter', text: 'lower the gravity to like 6 — then double jump unlocks', time: '3:22', me: true },
  { who: 'Kai', tone: 'mint', text: 'wait you can EDIT the physics?', time: '3:22' },
  { who: 'Ava', tone: 'butter', text: 'yep — open the Bear and look at Movement. im sending my version', time: '3:23', me: true },
  { who: 'Ava', tone: 'butter', attach: { title: 'Cloud Donut Bear — remix', kind: 'Platformer' }, time: '3:23', me: true },
];

const FEATURES: Array<{ tone: BubbleTone | 'sky'; icon: 'gamepad' | 'sparkle' | 'lock' | 'heart'; title: string; body: string }> = [
  { tone: 'butter', icon: 'gamepad', title: 'Share playable levels', body: 'Drop a game in chat — classmates tap to play without leaving the thread.' },
  { tone: 'mint', icon: 'sparkle', title: 'Ask Claude together', body: '@claude in any channel. The whole group sees the explanation.' },
  { tone: 'sky', icon: 'lock', title: 'Teacher-moderated', body: 'No DMs with strangers. Every channel has a teacher on it.' },
  { tone: 'coral', icon: 'heart', title: 'Kindness filter', body: 'Messages are gently rephrased if they come across as mean. Students approve the rewording.' },
];

export const Messaging = () => {
  const [typing, setTyping] = React.useState(true);
  React.useEffect(() => {
    const t = setInterval(() => setTyping((v) => !v), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <Section
      id="chat"
      label="Class chat"
      kicker="pink"
      title={<>Talk about the game, <span className="pbs-serif">inside the game.</span></>}
      sub="A classroom messenger built for making, not doom-scrolling. Share levels, ask for help, and see what your class is working on — all teacher-moderated."
    >
      <div className="pbs-messaging-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)', gap: 24, alignItems: 'start' }}>

        <Block tone="paper" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px', borderBottom: '1px dashed var(--pbs-line-2)',
            background: 'var(--pbs-cream-2)',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--pbs-sky)', border: '1.5px solid var(--pbs-sky-ink)',
              color: 'var(--pbs-sky-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="users" size={14} stroke={2.2}/>
            </div>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}># grade-7-math</div>
              <div className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)' }}>28 members · Mrs. Vasquez is watching</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <span style={{
                padding: '3px 8px', borderRadius: 999, background: 'var(--pbs-mint)',
                border: '1.5px solid var(--pbs-mint-ink)', color: 'var(--pbs-mint-ink)',
                fontSize: 10.5, fontWeight: 700,
              }}>● Safe</span>
            </div>
          </div>

          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 420, maxHeight: 480, overflow: 'hidden', background: 'var(--pbs-paper)' }}>
            {MESSAGES.map((m, i) => (
              <div key={i} className="pbs-bubble-in" style={{
                display: 'flex', gap: 8,
                flexDirection: m.me ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                animationDelay: `${i * 100}ms`,
              }}>
                <div style={{
                  flexShrink: 0,
                  width: 28, height: 28, borderRadius: 999,
                  background: `var(--pbs-${m.tone})`,
                  border: `1.5px solid var(--pbs-${m.tone}-ink)`,
                  color: `var(--pbs-${m.tone}-ink)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>{m.who[0]}</div>
                <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: m.me ? 'flex-end' : 'flex-start', gap: 3 }}>
                  {!m.me && (
                    <div style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', fontWeight: 600, padding: '0 4px' }}>{m.who} · <span className="pbs-mono" style={{ fontSize: 10 }}>{m.time}</span></div>
                  )}
                  {m.attach ? (
                    <div style={{
                      padding: 6, borderRadius: 14,
                      background: m.me ? 'var(--pbs-butter)' : 'var(--pbs-cream-2)',
                      border: `1.5px solid ${m.me ? 'var(--pbs-butter-ink)' : 'var(--pbs-line-2)'}`,
                      color: m.me ? 'var(--pbs-butter-ink)' : 'var(--pbs-ink)',
                      display: 'flex', gap: 8, alignItems: 'center',
                      maxWidth: 300,
                    }}>
                      <div style={{
                        width: 48, height: 38, borderRadius: 8,
                        background: 'var(--pbs-sky)', border: '1.5px solid var(--pbs-sky-ink)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--pbs-sky-ink)',
                        flexShrink: 0,
                      }}>
                        <Icon name="gamepad" size={16} stroke={2.2}/>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.attach.title}</div>
                        <div className="pbs-mono" style={{ fontSize: 10, opacity: 0.7 }}>remix · tap to play</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '8px 12px', borderRadius: 14,
                      background: m.me ? 'var(--pbs-butter)' : 'var(--pbs-cream-2)',
                      border: `1.5px solid ${m.me ? 'var(--pbs-butter-ink)' : 'var(--pbs-line-2)'}`,
                      color: m.me ? 'var(--pbs-butter-ink)' : 'var(--pbs-ink)',
                      fontSize: 13.5, lineHeight: 1.45,
                      borderBottomRightRadius: m.me ? 4 : 14,
                      borderBottomLeftRadius: m.me ? 14 : 4,
                    }}>{m.text}</div>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 999,
                  background: 'var(--pbs-grape)', border: '1.5px solid var(--pbs-grape-ink)',
                  color: 'var(--pbs-grape-ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>J</div>
                <div style={{
                  padding: '10px 14px', borderRadius: 14,
                  background: 'var(--pbs-cream-2)', border: '1.5px solid var(--pbs-line-2)',
                  display: 'flex', gap: 4,
                }}>
                  {[0,1,2].map((i) => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: 999, background: 'var(--pbs-ink-soft)',
                      animation: `pbs-blink 1.4s ${i*0.15}s infinite`,
                    }}/>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{
            padding: 10, borderTop: '1.5px solid var(--pbs-line)',
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--pbs-cream-2)',
          }}>
            <button type="button" style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'inherit',
            }}>
              <Icon name="gamepad" size={14} stroke={2.2}/>
            </button>
            <div style={{
              flex: 1, padding: '8px 12px', borderRadius: 10,
              background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line-2)',
              fontSize: 13, color: 'var(--pbs-ink-muted)',
            }}>Message #grade-7-math…</div>
            <button type="button" style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'var(--pbs-ink)', color: 'var(--pbs-butter)',
              border: '1.5px solid var(--pbs-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <Icon name="send" size={13} stroke={2.4}/>
            </button>
          </div>
        </Block>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <Pill tone="pink" icon="sparkle">Built for classmates, not strangers</Pill>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            A messenger that <span className="pbs-serif">knows your class</span>.
          </div>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--pbs-ink-soft)', lineHeight: 1.55, maxWidth: 480 }}>
            Chat lives inside the studio, not across three apps. Students can share levels as playable cards, co-edit games in real time, and ask Claude as a group — while teachers stay in the loop.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
            {FEATURES.map((f) => (
              <Block key={f.title} tone="paper" style={{ padding: 14 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: `var(--pbs-${f.tone})`, color: `var(--pbs-${f.tone}-ink)`,
                  border: `1.5px solid var(--pbs-${f.tone}-ink)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 10,
                }}>
                  <Icon name={f.icon} size={15} stroke={2.2}/>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.015em' }}>{f.title}</div>
                <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--pbs-ink-soft)', lineHeight: 1.5 }}>{f.body}</p>
              </Block>
            ))}
          </div>

          <div style={{
            padding: '14px 16px', borderRadius: 14,
            background: 'var(--pbs-ink)', color: 'var(--pbs-cream)',
            display: 'flex', gap: 10, alignItems: 'flex-start',
            marginTop: 4,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'var(--pbs-butter)', color: 'var(--pbs-butter-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon name="heart" size={14} stroke={2.4}/>
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 2 }}>Heads up, from Claude</div>
              <div style={{ fontSize: 12.5, color: 'var(--pbs-line-2)', lineHeight: 1.5 }}>
                &quot;That message sounded a bit sharp. Want to try: <em>&apos;Could you explain how you solved that? I&apos;m stuck.&apos;</em>&quot;
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
