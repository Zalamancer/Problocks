// Seed data for the teacher Messages view — per-class channels for group
// chat, and per-student DM threads. Ported verbatim from
// problocks/project/pb_teacher/messages.jsx.

export type ChannelIcon =
  | 'users' | 'smile' | 'sparkle' | 'bolt' | 'star' | 'image';

export type Channel = {
  id: string;
  name: string;
  desc: string;
  icon: ChannelIcon;
  pinned: boolean;
  unread: number;
  readOnly?: boolean;
};

export type ChatMessage = {
  who: string; // 'me' for the teacher, otherwise a student id
  t: string;
  text: string;
  react?: Record<string, number>;
  pinned?: boolean;
  attachment?: { kind: string; label: string };
};

export const CHANNELS_BY_CLASS: Record<string, Channel[]> = {
  c1: [
    { id: 'general',        name: 'general',        desc: 'everyone in period 3', icon: 'users',   pinned: true,  unread: 0 },
    { id: 'help',           name: 'help-desk',      desc: 'stuck? ask here',      icon: 'smile',   pinned: false, unread: 5 },
    { id: 'announcements',  name: 'announcements',  desc: 'teacher posts only',   icon: 'sparkle', pinned: true,  unread: 0, readOnly: true },
    { id: 'relay-teams',    name: 'relay-teams',    desc: 'team coordination',    icon: 'bolt',    pinned: false, unread: 2 },
    { id: 'brag-board',     name: 'brag-board',     desc: 'share your wins',      icon: 'star',    pinned: false, unread: 0 },
  ],
  c2: [
    { id: 'general',        name: 'general',        desc: 'everyone in period 5', icon: 'users',   pinned: true,  unread: 1 },
    { id: 'help',           name: 'help-desk',      desc: 'stuck? ask here',      icon: 'smile',   pinned: false, unread: 0 },
    { id: 'announcements',  name: 'announcements',  desc: 'teacher posts only',   icon: 'sparkle', pinned: true,  unread: 0, readOnly: true },
  ],
  c3: [
    { id: 'general',         name: 'general',         desc: 'pre-algebra crew',     icon: 'users',   pinned: true,  unread: 3 },
    { id: 'announcements',   name: 'announcements',   desc: 'teacher posts only',   icon: 'sparkle', pinned: true,  unread: 0, readOnly: true },
    { id: 'show-your-work',  name: 'show-your-work',  desc: 'post your solutions',  icon: 'image',   pinned: false, unread: 0 },
  ],
};

export const SEED_GROUP: Record<string, ChatMessage[]> = {
  'c1:general': [
    { who: 's3',  t: '9:12', text: 'anyone else actually liking the slope bakery one 🥐' },
    { who: 's1',  t: '9:13', text: 'the pastry names are sending me' },
    { who: 's7',  t: '9:14', text: 'wait what does "rise over run" mean if there\'s no hill' },
    { who: 'me',  t: '9:15', text: 'good question — think of it as how much y changes for each step x takes. no actual hills required 😅' },
    { who: 's3',  t: '9:16', text: 'ohhh that clicked' },
    { who: 's2',  t: '9:18', text: 'can we do another live relay this week', react: { '🔥': 4 } },
    { who: 'me',  t: '9:20', text: 'planning one for Friday. team captains in #relay-teams', pinned: true },
  ],
  'c1:help': [
    { who: 's5',  t: '8:02', text: 'on q7 of linear equations — i keep getting x = 4 but it says wrong' },
    { who: 's8',  t: '8:05', text: 'i got x = -4, check the sign on the second line' },
    { who: 's5',  t: '8:06', text: 'OH you\'re right. distribute the negative 🫠' },
    { who: 's9',  t: '8:41', text: 'how do i do the stretch question in probability carnival' },
    { who: 's12', t: '8:43', text: 'same, the 3 dice one' },
    { who: 'me',  t: '8:50', text: 'ok giving a hint: count the (a,b,c) triples that add to 10 first. there are 27.' },
  ],
  'c1:announcements': [
    { who: 'me',  t: 'Mon', text: 'Heads up: quiz Friday covers linear equations + slope. Live relay Wed to review.', pinned: true },
    { who: 'me',  t: 'Wed', text: 'Office hours moved to Thursday 3:30 this week.' },
  ],
  'c1:relay-teams': [
    { who: 's1',  t: '7:40', text: 'team butter — we\'re meeting in the library at lunch' },
    { who: 's6',  t: '7:42', text: 'team mint — study room 2, bring a calculator' },
    { who: 's4',  t: '7:51', text: 'is team coral doing anything lol' },
    { who: 's10', t: '7:55', text: '…we\'re winging it' },
  ],
  'c1:brag-board': [
    { who: 's8',  t: 'Mon', text: '21 day streak baby 🔥', react: { '🎉': 6, '🔥': 3 } },
    { who: 's3',  t: 'Tue', text: 'first 100% on a stretch question!!' },
  ],
  'c2:general': [
    { who: 's11', t: '1:45', text: 'wait is the homework due tonight or tomorrow' },
    { who: 'me',  t: '1:46', text: 'tomorrow 9pm. I pushed it back 👍' },
  ],
  'c2:help':          [{ who: 's11', t: '2:02', text: 'nothing stuck rn 😎' }],
  'c2:announcements': [{ who: 'me',  t: 'Tue',  text: 'Friendly reminder to bring graph paper Friday.' }],
  'c3:general': [
    { who: 's4', t: '10:01', text: 'fraction kingdom is actually fun' },
    { who: 's5', t: '10:03', text: 'the boss fight at the end 😭' },
    { who: 's6', t: '10:05', text: 'I died to 1/2 + 1/3 💀' },
  ],
  'c3:announcements': [{ who: 'me', t: 'Mon', text: 'Field trip permission slips due Friday.' }],
  'c3:show-your-work': [
    { who: 's10', t: '9:30', text: 'here\'s my area of hexagon work', attachment: { kind: 'sketch', label: 'hexagon-work.png' } },
    { who: 'me',  t: '9:40', text: 'clean. love the way you split it into 6 triangles.' },
  ],
};

export const SEED_DM: Record<string, ChatMessage[]> = {
  s5: [
    { who: 's5', t: 'Yesterday', text: 'Hi Ms. Rivera — I\'m kinda confused on the probability hw, can we talk tomorrow?' },
    { who: 'me', t: 'Yesterday', text: 'Of course! Stop by at lunch or before 1st period.' },
    { who: 's5', t: '8:31',      text: 'coming by at lunch 🙏' },
  ],
  s9: [
    { who: 'me', t: 'Mon', text: 'Ethan — noticed you missed the last two assignments. Everything ok?' },
    { who: 's9', t: 'Mon', text: 'sorry was out sick. catching up this week' },
    { who: 'me', t: 'Tue', text: 'No worries. Pushed your due date to Friday — ping if you need a hand.' },
  ],
  s12: [
    { who: 's12', t: '7:15', text: 'is it ok if I redo the shapes sprint? I rushed it' },
    { who: 'me',  t: '7:20', text: 'Yes — reopening it now. Take your time.' },
    { who: 's12', t: '7:21', text: 'thank you!! 🩵' },
  ],
  s3: [
    { who: 's3', t: 'Fri', text: 'thanks for the kind note on my stretch work 🥹' },
  ],
  s1: [
    { who: 'me', t: 'Thu', text: 'Ava — want to pilot the new Relay captain role next week?' },
    { who: 's1', t: 'Thu', text: 'yes!!!' },
  ],
};
