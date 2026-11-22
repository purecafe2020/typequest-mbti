/* =============================================================
   TYPEQUEST — DATA
   30 questions across 4 MBTI dimensions + 16 type profiles
   ============================================================= */

// 4 dimensions: EI, SN, TF, JP → each needs ~7-8 questions

const QUESTIONS = [
  // ===== ENERGY: Extraversion ↔ Introversion (8) =====
  { id: 1, dim: 'EI', text: 'At a party with 20 people, you feel most like yourself when...',
    options: [
      { label: 'Moving between groups, meeting new people', value: 'E' },
      { label: 'Having a deep conversation with one or two people', value: 'I' },
    ]},
  { id: 2, dim: 'EI', text: 'After a long day of socializing, you usually...',
    options: [
      { label: 'Feel energized and want more', value: 'E' },
      { label: 'Need quiet time to recharge alone', value: 'I' },
    ]},
  { id: 3, dim: 'EI', text: 'When you have a new idea, you prefer to...',
    options: [
      { label: 'Bounce it off someone right away', value: 'E' },
      { label: 'Think it through privately first', value: 'I' },
    ]},
  { id: 4, dim: 'EI', text: 'In group settings, you tend to be the one who...',
    options: [
      { label: 'Speaks up first and drives the energy', value: 'E' },
      { label: 'Listens more and contributes when ready', value: 'I' },
    ]},
  { id: 5, dim: 'EI', text: 'You prefer your workspace to be...',
    options: [
      { label: 'Open, collaborative, with people around', value: 'E' },
      { label: 'Private, quiet, where you can focus', value: 'I' },
    ]},
  { id: 6, dim: 'EI', text: 'Meeting a stranger at a café, you would...',
    options: [
      { label: 'Start the conversation naturally', value: 'E' },
      { label: 'Wait for them to speak first', value: 'I' },
    ]},
  { id: 7, dim: 'EI', text: 'You find that being alone for too long...',
    options: [
      { label: 'Makes you feel restless', value: 'E' },
      { label: 'Feels like pure luxury', value: 'I' },
    ]},
  { id: 8, dim: 'EI', text: 'When solving a problem, you think best when...',
    options: [
      { label: 'Talking it out with someone', value: 'E' },
      { label: 'Thinking it through silently', value: 'I' },
    ]},

  // ===== INFORMATION: Sensing ↔ Intuition (8) =====
  { id: 9, dim: 'SN', text: 'You trust most...',
    options: [
      { label: 'What you can see, hear, and measure', value: 'S' },
      { label: 'Your gut feelings and patterns you sense', value: 'N' },
    ]},
  { id: 10, dim: 'SN', text: 'When reading, you gravitate toward...',
    options: [
      { label: 'Real-world stories, biographies, practical guides', value: 'S' },
      { label: 'Science fiction, philosophy, abstract ideas', value: 'N' },
    ]},
  { id: 11, dim: 'SN', text: 'You notice when someone changes their...',
    options: [
      { label: 'Outfit or haircut — the details', value: 'S' },
      { label: 'Mood or energy — the vibe', value: 'N' },
    ]},
  { id: 12, dim: 'SN', text: 'Planning a trip, you focus on...',
    options: [
      { label: 'The concrete itinerary, times, places', value: 'S' },
      { label: 'The overall vibe and what it might inspire', value: 'N' },
    ]},
  { id: 13, dim: 'SN', text: 'You find it easier to...',
    options: [
      { label: 'Follow step-by-step instructions', value: 'S' },
      { label: 'Infer the big picture from a single clue', value: 'N' },
    ]},
  { id: 14, dim: 'SN', text: "You're more intrigued by...",
    options: [
      { label: "How something actually works right now", value: 'S' },
      { label: "What something could become in the future", value: 'N' },
    ]},
  { id: 15, dim: 'SN', text: 'When telling a story, you tend to...',
    options: [
      { label: 'Stick to facts and what actually happened', value: 'S' },
      { label: 'Embellish to capture the feeling or meaning', value: 'N' },
    ]},
  { id: 16, dim: 'SN', text: 'You would rather...',
    options: [
      { label: 'Build something with proven materials', value: 'S' },
      { label: 'Invent something entirely new', value: 'N' },
    ]},

  // ===== DECISION: Thinking ↔ Feeling (7) =====
  { id: 17, dim: 'TF', text: 'When a friend comes to you upset, you tend to...',
    options: [
      { label: 'Analyze the problem and suggest a solution', value: 'T' },
      { label: 'Validate their feelings and empathize first', value: 'F' },
    ]},
  { id: 18, dim: 'TF', text: 'You make important decisions based more on...',
    options: [
      { label: 'Logic, cost-benefit, and objective analysis', value: 'T' },
      { label: 'Values, emotions, and impact on people', value: 'F' },
    ]},
  { id: 19, dim: 'TF', text: 'It bothers you more when...',
    options: [
      { label: 'Something is factually wrong', value: 'T' },
      { label: 'Someone gets hurt or excluded', value: 'F' },
    ]},
  { id: 20, dim: 'TF', text: 'Giving feedback, you lean toward...',
    options: [
      { label: 'Being direct and honest, even if it stings', value: 'T' },
      { label: 'Being kind and preserving the relationship', value: 'F' },
    ]},
  { id: 21, dim: 'TF', text: 'You find it easier to...',
    options: [
      { label: 'Say no to someone when you need to', value: 'T' },
      { label: 'Put others\' needs before your own', value: 'F' },
    ]},
  { id: 22, dim: 'TF', text: 'Fairness to you means...',
    options: [
      { label: 'Applying the same rules to everyone', value: 'T' },
      { label: 'Giving each person what they personally need', value: 'F' },
    ]},
  { id: 23, dim: 'TF', text: 'You tend to cry at movies...',
    options: [
      { label: 'Rarely or never', value: 'T' },
      { label: 'More often than you\'d like to admit', value: 'F' },
    ]},

  // ===== LIFESTYLE: Judging ↔ Perceiving (7) =====
  { id: 24, dim: 'JP', text: 'Your ideal Sunday is...',
    options: [
      { label: 'Planned out — brunch, hike, dinner, all set', value: 'J' },
      { label: 'Open — see where the day takes you', value: 'P' },
    ]},
  { id: 25, dim: 'JP', text: 'Deadlines make you feel...',
    options: [
      { label: 'Comfortable — structure helps you perform', value: 'J' },
      { label: 'Anxious — you work best under pressure', value: 'P' },
    ]},
  { id: 26, dim: 'JP', text: 'Your desk or workspace is usually...',
    options: [
      { label: 'Organized, everything in its place', value: 'J' },
      { label: 'Creative chaos — organised enough for you', value: 'P' },
    ]},
  { id: 27, dim: 'JP', text: 'Making a major purchase, you...',
    options: [
      { label: 'Research thoroughly and decide early', value: 'J' },
      { label: 'Wait, keep options open, then impulse-buy', value: 'P' },
    ]},
  { id: 28, dim: 'JP', text: 'Having a strict routine feels...',
    options: [
      { label: 'Reassuring and productive', value: 'J' },
      { label: 'Boring and restrictive', value: 'P' },
    ]},
  { id: 29, dim: 'JP', text: 'You prefer to...',
    options: [
      { label: 'Finish things early and move on', value: 'J' },
      { label: 'Keep things open until the last minute', value: 'P' },
    ]},
  { id: 30, dim: 'JP', text: 'Unexpected changes to your plans...',
    options: [
      { label: 'Stress you out a bit', value: 'J' },
      { label: 'Excited you — new possibilities!', value: 'P' },
    ]},
];

/* =============================================================
   16 TYPE PROFILES
   ============================================================= */

const TYPES = {
  INTJ: { name: 'The Architect', tagline: 'Imaginative and strategic thinkers with a plan for everything.',
    strengths: ['Strategic masterminds', 'Highly independent', 'Ambitious and determined', 'Exceptional problem-solvers', 'Always learning'],
    weaknesses: ['Overly critical', 'Dismissive of emotions', 'Socially clueless', 'Impatient with inefficiency', 'Can be arrogant'],
    careers: ['Strategy Consultant', 'Data Scientist', 'Founder / CEO', 'Software Architect', 'Researcher'],
    relationship: 'INTJs take relationships seriously and look for long-term intellectual partners. They show love through actions (solving your problems, planning your future) rather than words. They need a partner who respects their need for space and can engage them on ideas, not just feelings.' },
  INTP: { name: 'The Logician', tagline: 'Innovative inventors with an unquenchable thirst for knowledge.',
    strengths: ['Analytical and original', 'Open-minded', 'Objective thinkers', 'Passionate about ideas', 'Enthusiastic learners'],
    weaknesses: ['Very private', 'Socially awkward', 'Absent-minded', 'Second-guess everything', 'Avoid emotional commitment'],
    careers: ['Researcher', 'Philosopher', 'Software Engineer', 'Mathematician', 'Academic'],
    relationship: 'INTPs approach relationships like a science experiment — curious, analytical, and a little uncertain. They bond over shared interests and intellectual banter. Emotions are not their strong suit, but they are fiercely loyal once committed.' },
  ENTJ: { name: 'The Commander', tagline: 'Bold, imaginative, and strong-willed leaders, always finding a way — or making one.',
    strengths: ['Natural born leaders', 'Strategic and efficient', 'Confident and charismatic', 'Hardworking', 'Great delegators'],
    weaknesses: ['Stubborn and domineering', 'Impatient', 'Cold and ruthless', 'Poor at expressing emotions', 'Treats people as resources'],
    careers: ['Executive / CEO', 'Management Consultant', 'Lawyer', 'Politician', 'Investment Banker'],
    relationship: 'ENTJs lead in love just like they lead everywhere — with vision and direction. They want a partner who matches their ambition and drive, someone they can build an empire with. Warmth is shown through shared goals and long-term investment.' },
  ENTP: { name: 'The Debater', tagline: 'Smart and curious thinkers who cannot resist an intellectual challenge.',
    strengths: ['Quick minds', 'Charismatic and witty', 'Energetic and enthusiastic', 'Open to new ideas', 'Great communicators'],
    weaknesses: ['Argumentative', 'Insensitive', 'Intolerant', 'Easily bored', 'Can\'t focus on one thing'],
    careers: ['Entrepreneur', 'Lawyer', 'Consultant', 'Journalist', 'Creative Director'],
    relationship: 'ENTPs are playful flirts who love the chase and the intellectual sparring. They need a partner who can banter back and isn\'t threatened by their debate mode. Commitment grows when they meet someone who truly challenges them.' },

  INFJ: { name: 'The Advocate', tagline: 'Quiet and mystical, yet very inspiring and tireless idealists.',
    strengths: ['Deeply empathetic', 'Highly intuitive', 'Passionate about values', 'Creative problem-solvers', 'Inspiring leaders'],
    weaknesses: ['Extremely private', 'Sensitive to criticism', 'Perfectionistic', 'Burn out easily', 'Gullible and idealistic'],
    careers: ['Therapist / Counselor', 'Nonprofit Leader', 'Writer', 'Human Resources', 'Minister / Chaplain'],
    relationship: 'INFJs seek soul-level connections — casual dating rarely fulfills them. They are warm, devoted partners who invest everything once they trust. They need gentle, honest communication and space for their rich inner world.' },
  INFP: { name: 'The Mediator', tagline: 'Poetic, kind and altruistic people, always eager to help a good cause.',
    strengths: ['Deeply empathetic', 'Open-minded and flexible', 'Creative and imaginative', 'Warm and caring', 'Passionate about values'],
    weaknesses: ['Too idealistic', 'Too altruistic', 'Impractical', 'Take things too personally', 'Difficult to get to know'],
    careers: ['Writer / Poet', 'Counselor', 'Graphic Designer', 'Psychologist', 'Nonprofit Worker'],
    relationship: 'INFPs are hopeless romantics who long for a deep, soulful partnership. They give everything in love and need to be cherished for who they truly are. A partner who listens, supports their dreams, and shares their values wins their heart forever.' },
  ENFJ: { name: 'The Protagonist', tagline: 'Charismatic and inspiring leaders, able to mesmerize their listeners.',
    strengths: ['Charismatic', 'Altruistic and inspiring', 'Excellent communicators', 'Reliable and passionate', 'Great leaders and team players'],
    weaknesses: ['Overly idealistic', 'Too selfless', 'Too sensitive', 'Fluctuating self-esteem', 'Struggle to make tough decisions'],
    careers: ['Teacher / Professor', 'Life Coach', 'Politician', 'Nonprofit Director', 'Human Resources'],
    relationship: 'ENFJs give their all in relationships — warm, generous, and committed to growing together. They read partners\' emotions almost intuitively and love supporting their loved ones\' dreams. They need a partner who appreciates their big heart.' },
  ENFP: { name: 'The Campaigner', tagline: 'Enthusiastic, creative and sociable free spirits, who can always find a reason to smile.',
    strengths: ['Enthusiastic and charismatic', 'Creative and imaginative', 'Warm and empathetic', 'Great communicators', 'Passionate'],
    weaknesses: ['Poor practical skills', 'Find it difficult to focus', 'Overthink things', 'Get stressed easily', 'Highly emotional'],
    careers: ['Journalist', 'Actor', 'Marketing / Brand', 'Entrepreneur', 'Psychologist'],
    relationship: 'ENFPs are passionate, playful partners who fall hard and fast. They thrive on excitement, deep conversation, and shared adventures. Routine is their kryptonite — they need spontaneity and a partner who fuels their fire.' },

  ISTJ: { name: 'The Logistician', tagline: 'Practical and fact-minded individuals, whose reliability cannot be doubted.',
    strengths: ['Honest and direct', 'Strong willed', 'Very responsible', 'Calm and practical', 'Create and enforce order'],
    weaknesses: ['Stubborn', 'Insensitive', 'Always by the book', 'Judgmental', 'Often unreasonably blame self'],
    careers: ['Accountant', 'Project Manager', 'Judge', 'Logistics Manager', 'Banker'],
    relationship: 'ISTJs are steady, loyal partners who take commitment seriously. They show love through reliability — paying bills on time, keeping promises, building a stable life. They need partners who appreciate tradition and responsibility.' },
  ISFJ: { name: 'The Defender', tagline: 'Very dedicated and warm protectors, always ready to defend their loved ones.',
    strengths: ['Supportive and reliable', 'Patient and warm', 'Observant', 'Loyal and hardworking', 'Good at connecting with others'],
    weaknesses: ['Humble and shy', 'Take things too personally', 'Repress feelings', 'Overload themselves', 'Reluctant to change'],
    careers: ['Nurse / Caregiver', 'Teacher', 'Administrator', 'Social Worker', 'Librarian'],
    relationship: 'ISFJs are the ultimate caregivers in love — devoted, attentive, and always putting their partner first. They need to be appreciated and not taken for granted. Small gestures of affection mean the world to them.' },
  ESTJ: { name: 'The Executive', tagline: 'Excellent administrators, unsurpassed at managing things — or people.',
    strengths: ['Dedicated and strong-willed', 'Direct and honest', 'Loyal, patient, reliable', 'Enjoy creating order', 'Great at managing'],
    weaknesses: ['Inflexible and stubborn', 'Uncomfortable with unconventional situations', 'Judgmental', 'Too focused on social status', 'Difficulty expressing emotions'],
    careers: ['Operations Manager', 'Financial Officer', 'Judge', 'Politician', 'Business Administrator'],
    relationship: 'ESTJs are committed partners who value tradition, stability, and family. They take on the role of provider and organizer, often in practical, tangible ways. They need a partner who respects their leadership and shares their values.' },
  ESFJ: { name: 'The Consul', tagline: 'Extraordinarily caring, social and popular people, always eager to help.',
    strengths: ['Warm-hearted and popular', 'Loyal and sensitive', 'Strong practical skills', 'Excellent at connecting with others', 'Very caring'],
    weaknesses: ['Worried about their status', 'Inflexible', 'Reluctant to innovate', 'Vulnerable to criticism', 'Often too needy'],
    careers: ['Teacher', 'Nurse', 'Event Planner', 'Human Resources', 'Customer Success Manager'],
    relationship: 'ESFJs are warm, attentive partners who create cozy, loving homes. They thrive on togetherness and small daily acts of care. A partner who reciprocates their thoughtfulness makes them incredibly happy.' },

  ISTP: { name: 'The Virtuoso', tagline: 'Bold and practical experimenters, masters of all kinds of tools.',
    strengths: ['Optimistic and energetic', 'Creative and practical', 'Spontaneous and rational', 'Know how to prioritize', 'Great in a crisis'],
    weaknesses: ['Stubborn', 'Insensitive', 'Private and reserved', 'Easily bored', 'Dislike commitment'],
    careers: ['Engineer', 'Mechanic', 'Pilot', 'Detective / Investigator', 'Forensic Scientist'],
    relationship: 'ISTPs are quiet, curious partners who show love through actions — fixing your bike, building you something, or quietly supporting you. They need space and don\'t do well with clinginess. Trust and shared adventures are key.' },
  ISFP: { name: 'The Adventurer', tagline: 'Flexible and charming artists, always ready to explore and experience something new.',
    strengths: ['Charming', 'Sensitive to others\' feelings', 'Imaginative', 'Passionate', 'Curious'],
    weaknesses: ['Fiercely independent', 'Unpredictable', 'Easily stressed', 'Overly competitive', 'Fluctuating self-esteem'],
    careers: ['Artist / Designer', 'Musician', 'Chef', 'Veterinarian', 'Photographer'],
    relationship: 'ISFPs are gentle, affectionate partners who love expressing love through creativity and shared experiences. They live in the moment and need a partner who joins them in their adventures without demanding too much structure.' },
  ESTP: { name: 'The Entrepreneur', tagline: 'Smart, energetic and very perceptive people, who truly enjoy living on the edge.',
    strengths: ['Bold, rational, original', 'Perceptive', 'Direct and honest', 'Excellent people skills', 'Love being the center of attention'],
    weaknesses: ['Impatient', 'Risk-prone', 'Unstructured', 'May miss the bigger picture', 'Dislike theoretical concepts'],
    careers: ['Entrepreneur', 'Sales Executive', 'Paramedic', 'Athlete', 'Investigator'],
    relationship: 'ESTPs are fun, spontaneous partners who bring excitement to every date. They live for the thrill — adventure, banter, and surprise. Long-term commitment can be tricky, but when they settle, they make fiercely loyal, action-oriented partners.' },
  ESFP: { name: 'The Entertainer', tagline: 'Spontaneous, energetic and enthusiastic people — life is never boring around them.',
    strengths: ['Bold, original, aesthetic', 'Showmanship', 'Practical', 'Observant', 'Excellent people skills'],
    weaknesses: ['Sensitive', 'Conflict-averse', 'Easily bored', 'Poor long-term planners', 'Unfocused'],
    careers: ['Event Planner', 'Performer / Actor', 'Marketing', 'Personal Trainer', 'Flight Attendant'],
    relationship: 'ESFPs are warm, playful partners who light up a room — and your life. They shower loved ones with affection, fun, and spontaneity. They need a partner who keeps up with their energy and appreciates their big, open heart.' },
};
