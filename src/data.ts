import { Subject, Question, Gift } from './types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'pronunciation',
    name: 'Phát Âm Cốt Lõi (Pronunciation)',
    icon: 'Volume2',
    questionsCount: 5,
    description: 'Lấy lại căn bản 44 âm IPA tiếng Anh, phân biệt nguyên âm ngắn/dài, cách nhấn trọng âm và nối âm cơ bản.'
  },
  {
    id: 'vocabulary',
    name: 'Từ Vựng Sách Giáo Khoa (Vocabulary)',
    icon: 'BookOpen',
    questionsCount: 5,
    description: 'Học từ vựng theo chủ đề quen thuộc của chương trình THCS (Trường học, Gia đình, Hobbies, Môi trường).'
  },
  {
    id: 'paragraphs',
    name: 'Luyện Đoạn Văn (Paragraph Reading)',
    icon: 'FileText',
    questionsCount: 4,
    description: 'Luyện đọc các đoạn văn ngắn, mẫu câu đàm thoại THCS để tạo phản xạ nói tự nhiên, chuẩn ngữ điệu.'
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  // PRONUNCIATION QUESTIONS (Microphone speaking practice)
  {
    id: 'p1',
    subjectId: 'pronunciation',
    content: 'The green sheep is sleeping on the beach.',
    type: 'pronunciation',
    correctAnswer: 'the green sheep is sleeping on the beach',
    explanation: 'Luyện phát âm âm /i:/ dài trong các từ: green, sheep, sleeping, beach. Hãy mở rộng khóe môi sang hai bên như đang cười.',
    difficulty: 'easy'
  },
  {
    id: 'p2',
    subjectId: 'pronunciation',
    content: 'A fat cat wearing a black hat sat on the mat.',
    type: 'pronunciation',
    correctAnswer: 'a fat cat wearing a black hat sat on the mat',
    explanation: 'Luyện âm /æ/ (bẹt) trong: fat, cat, black, hat, sat, mat. Hạ hàm dưới xuống và phát âm chữ A thiên về E một chút.',
    difficulty: 'medium'
  },
  {
    id: 'p3',
    subjectId: 'pronunciation',
    content: 'She sells seashells by the seashore.',
    type: 'pronunciation',
    correctAnswer: 'she sells seashells by the seashore',
    explanation: 'Phân biệt âm /ʃ/ (s nặng - chu môi tròn) trong "she, seashells, seashore" và âm /s/ (s nhẹ) trong "sells, seashells, seashore".',
    difficulty: 'hard'
  },
  {
    id: 'p4',
    subjectId: 'pronunciation',
    content: 'The thin thief went through thirty thick thorns.',
    type: 'pronunciation',
    correctAnswer: 'the thin thief went through thirty thick thorns',
    explanation: 'Luyện âm vô thanh /θ/ (âm thổi hơi giữa hai răng) trong: thin, thief, through, thirty, thick, thorns.',
    difficulty: 'hard'
  },
  {
    id: 'p5',
    subjectId: 'pronunciation',
    content: 'I love learning English every single day.',
    type: 'pronunciation',
    correctAnswer: 'i love learning english every single day',
    explanation: 'Luyện âm hữu thanh /v/ trong "love, every" kết hợp nối âm "learning English". Hãy rung dây thanh quản khi phát âm âm /v/.',
    difficulty: 'easy'
  },

  // VOCABULARY QUESTIONS (Multiple Choice and Fill in blanks)
  {
    id: 'v1',
    subjectId: 'vocabulary',
    content: 'My younger brother usually ________ his bicycle to school every morning.',
    type: 'multiple-choice',
    options: ['rides', 'ride', 'riding', 'rode'],
    correctAnswer: 'rides',
    explanation: 'Giải thích: Thì Hiện tại đơn diễn tả thói quen lặp đi lặp lại hàng ngày. Chủ ngữ số ít "My younger brother" đi với động từ thêm "s/es" -> "rides".',
    difficulty: 'easy'
  },
  {
    id: 'v2',
    subjectId: 'vocabulary',
    content: 'English is considered an international ________ because it is spoken all over the world.',
    type: 'multiple-choice',
    options: ['subject', 'country', 'language', 'nationality'],
    correctAnswer: 'language',
    explanation: 'Giải thích: "international language" có nghĩa là "ngôn ngữ quốc tế". Câu dịch: Tiếng Anh được coi là một ngôn ngữ quốc tế bởi vì nó được nói trên toàn thế giới.',
    difficulty: 'medium'
  },
  {
    id: 'v3',
    subjectId: 'vocabulary',
    content: 'Please turn ________ the lights before going to bed to save electricity.',
    type: 'multiple-choice',
    options: ['on', 'off', 'up', 'down'],
    correctAnswer: 'off',
    explanation: 'Giải thích: Cụm động từ "turn off" nghĩa là "tắt" (tắt đèn để tiết kiệm điện). "turn on" là bật.',
    difficulty: 'easy'
  },
  {
    id: 'v4',
    subjectId: 'vocabulary',
    content: 'Complete the word: Students go to the s_ _ _ _ _ l library to borrow books.',
    type: 'fill-blank',
    correctAnswer: 'school',
    explanation: 'Giải thích: Từ còn thiếu là "school" (trường học). "school library" có nghĩa là thư viện trường học.',
    difficulty: 'easy'
  },
  {
    id: 'v5',
    subjectId: 'vocabulary',
    content: 'The person who teaches pupils in a classroom is called a t_ _ _ _ _ r.',
    type: 'fill-blank',
    correctAnswer: 'teacher',
    explanation: 'Giải thích: Từ cần điền là "teacher" (giáo viên), người giảng dạy học sinh trong lớp học.',
    difficulty: 'easy'
  },

  // PARAGRAPH QUESTIONS (Longer readings for continuous speech check)
  {
    id: 'pa1',
    subjectId: 'paragraphs',
    content: 'Hello! My name is Nam. I am twelve years old and I am in grade six. I live in a quiet village with my family. My school is small but very beautiful.',
    type: 'pronunciation',
    correctAnswer: 'hello my name is nam i am twelve years old and i am in grade six i live in a quiet village with my family my school is small but very beautiful',
    explanation: 'Luyện đọc đoạn văn giới thiệu bản thân lớp 6. Chú ý các từ nối hơi như "years_old" và phát âm rõ âm đuôi /z/ trong "is", "years".',
    difficulty: 'easy'
  },
  {
    id: 'pa2',
    subjectId: 'paragraphs',
    content: 'Learning English is extremely useful. It helps me read interesting books, listen to great music, and chat with friends from different countries.',
    type: 'pronunciation',
    correctAnswer: 'learning english is extremely useful it helps me read interesting books listen to great music and chat with friends from different countries',
    explanation: 'Luyện nói về lợi ích của tiếng Anh. Chú ý nhấn mạnh từ khoá (English, useful, read, books, music, friends, countries) để tạo nhịp điệu.',
    difficulty: 'medium'
  },
  {
    id: 'pa3',
    subjectId: 'paragraphs',
    content: 'Yesterday, we had an outdoor activity in our school yard. We collected plastic bottles and planted many young green trees to make our school cleaner.',
    type: 'pronunciation',
    correctAnswer: 'yesterday we had an outdoor activity in our school yard we collected plastic bottles and planted many young green trees to make our school cleaner',
    explanation: 'Luyện đọc động từ đuôi -ed trong quá khứ: "collected" (/ɪd/) và "planted" (/ɪd/). Đọc lướt qua các từ nối như "in", "and", "to".',
    difficulty: 'medium'
  },
  {
    id: 'pa4',
    subjectId: 'paragraphs',
    content: 'If you want to master English, you must practice speaking it every single day. Do not be afraid of making mistakes, because mistakes help you grow.',
    type: 'pronunciation',
    correctAnswer: 'if you want to master english you must practice speaking it every single day do not be afraid of making mistakes because mistakes help you grow',
    explanation: 'Lời khuyên truyền động lực học tiếng Anh. Đoạn văn chứa cấu trúc điều kiện loại 1. Hãy đọc to, rõ ràng và có cảm xúc tự tin.',
    difficulty: 'hard'
  }
];

export const AVAILABLE_GIFTS: Gift[] = [
  {
    id: 'gift_pdf_100_vocab',
    name: 'Sổ tay 100 từ vựng cốt lõi THCS thi vào 10 (PDF)',
    cost: 150,
    description: 'Bản mềm tổng hợp đầy đủ từ vựng ăn điểm kèm ví dụ minh họa sinh động giúp bứt phá điểm thi Học kỳ và Tuyển sinh 10.',
    icon: 'FileDown',
    type: 'document'
  },
  {
    id: 'gift_lucky_pen',
    name: 'Bút Chì May Mắn May mắn Khắc Tên',
    cost: 1200,
    description: 'Bút gỗ cao cấp khắc tên học sinh kèm lời chúc thi tốt, chuyển phát trực tiếp tới tận nhà miễn phí phí vận chuyển!',
    icon: 'PenTool',
    type: 'physical'
  },
  {
    id: 'gift_bubble_tea',
    name: 'Voucher Trà Sữa Động Lực (50K)',
    cost: 750,
    description: 'Mã giảm giá 50.000đ áp dụng tại các chuỗi Ding Tea, ToCoToCo, Mixue để bạn tự thưởng cho nỗ lực học tập xuất sắc.',
    icon: 'Gift',
    type: 'voucher'
  },
  {
    id: 'gift_badge_gold',
    name: 'Huy hiệu "Chiến Thần Phát Âm" Vinh Danh',
    cost: 300,
    description: 'Nhãn danh hiệu lấp lánh xuất hiện ngay trên ảnh đại diện và bảng xếp hạng, chứng minh thực lực đọc chuẩn của bạn.',
    icon: 'Award',
    type: 'badge'
  },
  {
    id: 'gift_sticker_sheet',
    name: 'Set 20 Sticker Học Tiếng Anh Siêu Cute',
    cost: 500,
    description: 'Bộ decal dán vở dán máy tính với các câu slogan khích lệ học tiếng Anh độc quyền của EnglishRoot.',
    icon: 'Grid',
    type: 'physical'
  }
];
