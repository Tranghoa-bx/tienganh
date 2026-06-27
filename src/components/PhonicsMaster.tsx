import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2, Play, Check, X, Award, Sparkles, HelpCircle,
  Trophy, RotateCcw, ChevronRight, Lightbulb, Smile, Star
} from 'lucide-react';

interface PhonicsLetter {
  letter: string;
  pronunciation: string; // e.g. "ay" /eɪ/
  sound: string; // e.g. /æ/
  example: string;
  exampleTranslation: string;
  vietnameseTrick: string;
}

interface PhonicsVowel {
  sound: string;
  type: 'short' | 'long';
  mouthShape: string;
  examples: { word: string; translation: string; ipa?: string }[];
  vietnameseTrick?: string;
}

interface PhonicsBlend {
  blend: string;
  sound: string;
  explanation: string;
  examples: { word: string; translation: string; ipa?: string }[];
  vietnameseTrick?: string;
}

interface DigraphCombination {
  combination: string;
  sound: string;
  explanation: string;
  examples: { word: string; translation: string; ipa?: string }[];
  vietnameseTrick?: string;
}

// 26 English Letters with name, Phonics Sound, and Sample Words
const ALPHABET_DATA: PhonicsLetter[] = [
  { letter: 'A', pronunciation: '/eɪ/', sound: '/æ/', example: 'Apple', exampleTranslation: 'Quả táo', vietnameseTrick: 'Tên đọc là "Ây". Âm giống lai giữa "a" và "e", mở rộng miệng như con dê kêu "beee".' },
  { letter: 'B', pronunciation: '/biː/', sound: '/b/', example: 'Baby', exampleTranslation: 'Em bé', vietnameseTrick: 'Tên đọc là "Bi". Âm giống chữ "bờ" lướt siêu nhanh, không rung cổ họng.' },
  { letter: 'C', pronunciation: '/siː/', sound: '/k/ hoặc /s/', example: 'Cat', exampleTranslation: 'Con mèo', vietnameseTrick: 'Tên đọc là "Xi". Âm giống chữ "khờ" nhẹ khạc hơi từ cổ họng.' },
  { letter: 'D', pronunciation: '/diː/', sound: '/d/', example: 'Dog', exampleTranslation: 'Con chó', vietnameseTrick: 'Tên đọc là "Đi". Âm bật lưỡi "đờ" cực nhanh, răng chạm nhẹ đầu lưỡi.' },
  { letter: 'E', pronunciation: '/iː/', sound: '/e/', example: 'Egg', exampleTranslation: 'Quả trứng', vietnameseTrick: 'Tên đọc là "I-i". Âm giống hệt chữ "e" trong tiếng Việt dứt khoát.' },
  { letter: 'F', pronunciation: '/ef/', sound: '/f/', example: 'Fish', exampleTranslation: 'Con cá', vietnameseTrick: 'Tên đọc là "Ép". Âm thổi hơi "phờ" bằng cách cắn hờ môi dưới (như xi tè em bé).' },
  { letter: 'G', pronunciation: '/dʒiː/', sound: '/ɡ/ hoặc /dʒ/', example: 'Goat', exampleTranslation: 'Con dê', vietnameseTrick: 'Tên đọc là "Di" rung môi. Âm giống chữ "gờ" giật nhẹ cổ họng.' },
  { letter: 'H', pronunciation: '/eɪtʃ/', sound: '/h/', example: 'Hat', exampleTranslation: 'Cái mũ', vietnameseTrick: 'Tên đọc là "Ếch". Âm giống tiếng "hà hơi" thổi ấm tay ngày lạnh.' },
  { letter: 'I', pronunciation: '/aɪ/', sound: '/ɪ/', example: 'Ink', exampleTranslation: 'Lọ mực', vietnameseTrick: 'Tên đọc là "Ai". Âm là chữ "i" siêu ngắn, giật từ bụng như bị nấc cụt.' },
  { letter: 'J', pronunciation: '/dʒeɪ/', sound: '/dʒ/', example: 'Jam', exampleTranslation: 'Mứt hoa quả', vietnameseTrick: 'Tên đọc là "Giây". Âm uốn lưỡi rung môi mạnh như chữ "Chờ" nặng có điện giật.' },
  { letter: 'K', pronunciation: '/keɪ/', sound: '/k/', example: 'Kite', exampleTranslation: 'Cái diều', vietnameseTrick: 'Tên đọc là "Khây". Âm khạc hơi "khờ" từ cổ họng không phát tiếng.' },
  { letter: 'L', pronunciation: '/el/', sound: '/l/', example: 'Lemon', exampleTranslation: 'Quả chanh', vietnameseTrick: 'Tên đọc là "Eo". Âm uốn cong đầu lưỡi lên chạm chân răng trên.' },
  { letter: 'M', pronunciation: '/em/', sound: '/m/', example: 'Monkey', exampleTranslation: 'Con khỉ', vietnameseTrick: 'Tên đọc là "Em". Âm mím môi kêu "ừm..." ngọt ngào khi thấy đồ ăn ngon.' },
  { letter: 'N', pronunciation: '/en/', sound: '/n/', example: 'Nut', exampleTranslation: 'Hạt dẻ', vietnameseTrick: 'Tên đọc là "En". Âm hé răng ngân "ừn..." hơi đi lên đường mũi.' },
  { letter: 'O', pronunciation: '/əʊ/', sound: '/ɒ/ hoặc /ɔː/', example: 'Octopus', exampleTranslation: 'Con bạch tuộc', vietnameseTrick: 'Tên đọc là "Âu". Âm hạ cằm đọc "o" ngắn dứt khoát.' },
  { letter: 'P', pronunciation: '/piː/', sound: '/p/', example: 'Pencil', exampleTranslation: 'Bút chì', vietnameseTrick: 'Tên đọc là "Pi". Âm mím chặt môi bật hơi "phờ" (không phát âm thành chữ bờ).' },
  { letter: 'Q', pronunciation: '/kjuː/', sound: '/kw/', example: 'Queen', exampleTranslation: 'Nữ hoàng', vietnameseTrick: 'Tên đọc là "Kiu". Âm đọc tròn môi lướt nhanh giống chữ "quờ" tiếng Việt.' },
  { letter: 'R', pronunciation: '/ɑː(r)//', sound: '/r/', example: 'Rabbit', exampleTranslation: 'Con thỏ', vietnameseTrick: 'Tên đọc là "A-ờ". Âm uốn lưỡi sâu vào trong như tiếng chó gầm gừ "gừr...".' },
  { letter: 'S', pronunciation: '/es/', sound: '/s/', example: 'Sun', exampleTranslation: 'Mặt trời', vietnameseTrick: 'Tên đọc là "Ét". Âm giống tiếng rắn xì "xì..." qua kẽ răng khép.' },
  { letter: 'T', pronunciation: '/tiː/', sound: '/t/', example: 'Tiger', exampleTranslation: 'Con hổ', vietnameseTrick: 'Tên đọc là "Ti". Âm đặt đầu lưỡi sau răng cửa giật bật hơi "thờ".' },
  { letter: 'U', pronunciation: '/juː/', sound: '/ʌ/ hoặc /ʊ/', example: 'Umbrella', exampleTranslation: 'Cái ô', vietnameseTrick: 'Tên đọc là "Diu". Âm giống chữ "á" ngắn hụt hơi.' },
  { letter: 'V', pronunciation: '/viː/', sound: '/v/', example: 'Violin', exampleTranslation: 'Đàn vĩ cầm', vietnameseTrick: 'Tên đọc là "Vi". Âm cắn môi dưới thổi rung bần bật cổ họng "vừ..."' },
  { letter: 'W', pronunciation: '/ˈdʌbljuː/', sound: '/w/', example: 'Water', exampleTranslation: 'Nước', vietnameseTrick: 'Tên đọc là "Đáp-bờ-liu". Âm chu tròn môi rồi mở rộng ra.' },
  { letter: 'X', pronunciation: '/eks/', sound: '/ks/', example: 'Xylophone', exampleTranslation: 'Đàn mộc cầm', vietnameseTrick: 'Tên đọc là "Ếch-xì". Âm bật hơi "k" rồi xì hơi "s..." liền nhau cực nhanh.' },
  { letter: 'Y', pronunciation: '/waɪ/', sound: '/j/', example: 'Yo-yo', exampleTranslation: 'Cái yo-yo', vietnameseTrick: 'Tên đọc là "Quai". Âm đọc lướt như từ "dờ" nhẹ của miền Nam.' },
  { letter: 'Z', pronunciation: '/zed/ hoặc /ziː/', sound: '/z/', example: 'Zebra', exampleTranslation: 'Con ngựa vằn', vietnameseTrick: 'Tên đọc là "Dét". Âm khép răng thổi hơi rung họng như con ong kêu "zừr...".' }
];

// Short & Long Vowels Data
const VOWELS_DATA: PhonicsVowel[] = [
  // Short Vowels
  {
    sound: '/æ/',
    type: 'short',
    mouthShape: 'Mở rộng khóe miệng sang hai bên và hạ cằm xuống thấp. Âm phát ra dứt khoát.',
    vietnameseTrick: 'Há to miệng đọc chữ "A" nhưng dẹt môi như đang quát ai đó "A!".',
    examples: [
      { word: 'cat', translation: 'con mèo', ipa: '/kæt/' },
      { word: 'bag', translation: 'cái túi', ipa: '/bæɡ/' },
      { word: 'man', translation: 'người đàn ông', ipa: '/mæn/' },
      { word: 'sad', translation: 'buồn bã', ipa: '/sæd/' }
    ]
  },
  {
    sound: '/e/',
    type: 'short',
    mouthShape: 'Miệng mở rộng vừa phải sang hai bên, môi thả lỏng. Âm ngắn và dứt khoát.',
    vietnameseTrick: 'Đọc giống hệt chữ "E" tiếng Việt nhưng phát âm cực ngắn, giật bụng.',
    examples: [
      { word: 'bed', translation: 'cái giường', ipa: '/bed/' },
      { word: 'pen', translation: 'bút mực', ipa: '/pen/' },
      { word: 'leg', translation: 'cái chân', ipa: '/leɡ/' },
      { word: 'help', translation: 'giúp đỡ', ipa: '/help/' }
    ]
  },
  {
    sound: '/ɪ/',
    type: 'short',
    mouthShape: 'Môi hơi mở rộng sang hai bên như mỉm cười nhẹ. Âm ngắn, gọn, sắc sảo.',
    vietnameseTrick: 'Đọc lai giữa âm "I" và âm "Ê", phát ra nhanh như khi đang nấc cụt.',
    examples: [
      { word: 'sit', translation: 'ngồi', ipa: '/sɪt/' },
      { word: 'pin', translation: 'cái ghim', ipa: '/pɪn/' },
      { word: 'fish', translation: 'con cá', ipa: '/fɪʃ/' },
      { word: 'milk', translation: 'sữa', ipa: '/mɪlk/' }
    ]
  },
  {
    sound: '/ɒ/',
    type: 'short',
    mouthShape: 'Môi tròn nhẹ, hàm dưới hạ xuống thấp. Phát âm O ngắn và dứt khoát.',
    vietnameseTrick: 'Đọc gần giống chữ "O" tiếng Việt nhưng gọn lại, không kéo dài giọng.',
    examples: [
      { word: 'hot', translation: 'nóng', ipa: '/hot/' },
      { word: 'dog', translation: 'con chó', ipa: '/dɒɡ/' },
      { word: 'box', translation: 'cái hộp', ipa: '/bɒks/' },
      { word: 'stop', translation: 'dừng lại', ipa: '/stɒp/' }
    ]
  },
  {
    sound: '/ʌ/',
    type: 'short',
    mouthShape: 'Miệng mở hé tự nhiên, lưỡi thả lỏng đặt thấp.',
    vietnameseTrick: 'Phát âm cực ngắn gần giống chữ "Á" lai với chữ "Ơ" trong tiếng Việt.',
    examples: [
      { word: 'cup', translation: 'cái cốc', ipa: '/kʌp/' },
      { word: 'bus', translation: 'xe buýt', ipa: '/bʌs/' },
      { word: 'sun', translation: 'mặt trời', ipa: '/sʌn/' },
      { word: 'duck', translation: 'con vịt', ipa: '/dʌk/' }
    ]
  },
  {
    sound: '/ʊ/',
    type: 'short',
    mouthShape: 'Môi hơi tròn và hướng nhẹ ra phía trước, âm ngắn thoát từ cổ họng.',
    vietnameseTrick: 'Đọc lai giữa âm "U" và âm "Ư" của tiếng Việt, tuyệt đối không chu môi dài.',
    examples: [
      { word: 'book', translation: 'quyển sách', ipa: '/bʊk/' },
      { word: 'foot', translation: 'bàn chân', ipa: '/fʊt/' },
      { word: 'good', translation: 'tốt', ipa: '/ɡʊd/' },
      { word: 'put', translation: 'đặt, để', ipa: '/pʊt/' }
    ]
  },
  {
    sound: '/ə/',
    type: 'short',
    mouthShape: 'Âm lười biếng nhất! Thả lỏng toàn bộ khuôn mặt, hé nhẹ môi tự nhiên.',
    vietnameseTrick: 'Đọc lướt như chữ "Ơ" siêu nhẹ, xuất hiện ở các âm không nhấn trọng âm.',
    examples: [
      { word: 'teacher', translation: 'giáo viên', ipa: '/ˈtiː.tʃər/' },
      { word: 'banana', translation: 'quả chuối', ipa: '/bəˈnɑː.nə/' },
      { word: 'mother', translation: 'người mẹ', ipa: '/ˈmʌð.ər/' },
      { word: 'about', translation: 'về cái gì', ipa: '/əˈbaʊt/' }
    ]
  },

  // Long Vowels
  {
    sound: '/iː/',
    type: 'long',
    mouthShape: 'Mở rộng môi hết cỡ sang hai bên như cười thật tươi, kéo dài hơi ra từ 1.5 - 2 giây.',
    vietnameseTrick: 'Đọc âm "I-i-i" kéo dài như khi chụp ảnh và nói "Cheese!".',
    examples: [
      { word: 'sheep', translation: 'con cừu', ipa: '/ʃiːp/' },
      { word: 'green', translation: 'màu xanh lá', ipa: '/ɡriːn/' },
      { word: 'sea', translation: 'biển', ipa: '/siː/' },
      { word: 'eat', translation: 'ăn', ipa: '/iːt/' }
    ]
  },
  {
    sound: '/ɑː/',
    type: 'long',
    mouthShape: 'Hạ cằm sâu, mở rộng miệng to hết cỡ, đẩy hơi dài từ sâu trong họng ra.',
    vietnameseTrick: 'Mở miệng giống hệt khi bác sĩ bảo nói "A-a-a" để kiểm tra họng.',
    examples: [
      { word: 'car', translation: 'ô tô', ipa: '/kɑːr/' },
      { word: 'star', translation: 'ngôi sao', ipa: '/stɑːr/' },
      { word: 'park', translation: 'công viên', ipa: '/pɑːrk/' },
      { word: 'father', translation: 'người cha', ipa: '/ˈfɑː.ðər/' }
    ]
  },
  {
    sound: '/ɔː/',
    type: 'long',
    mouthShape: 'Tròn môi hết mức, uốn nhẹ lưỡi về phía sau, kéo hơi dài trầm lắng.',
    vietnameseTrick: 'Đọc âm "O-o-o" kéo dài từ cổ họng như khi đang "Ồ" lên kinh ngạc.',
    examples: [
      { word: 'door', translation: 'cái cửa', ipa: '/dɔːr/' },
      { word: 'horse', translation: 'con ngựa', ipa: '/hɔːrs/' },
      { word: 'ball', translation: 'quả bóng', ipa: '/bɔːl/' },
      { word: 'morning', translation: 'buổi sáng', ipa: '/ˈmɔː.nɪŋ/' }
    ]
  },
  {
    sound: '/uː/',
    type: 'long',
    mouthShape: 'Môi khép tròn và chu ra phía trước, đẩy luồng hơi dài liên tục.',
    vietnameseTrick: 'Đọc âm "U-u-u" dài và chu môi hờn dỗi như khi đang huýt sáo.',
    examples: [
      { word: 'boot', translation: 'cái ủng', ipa: '/buːt/' },
      { word: 'cool', translation: 'mát mẻ, ngầu', ipa: '/kuːl/' },
      { word: 'blue', translation: 'màu xanh dương', ipa: '/bluː/' },
      { word: 'food', translation: 'đồ ăn', ipa: '/fuːd/' }
    ]
  },
  {
    sound: '/ɜː/',
    type: 'long',
    mouthShape: 'Hé miệng nhẹ, lưỡi hơi cong ở giữa khoang miệng, kéo hơi dài hơi.',
    vietnameseTrick: 'Đọc gần giống chữ "Ơ" kéo dài kết hợp rụt cong lưỡi về phía sau.',
    examples: [
      { word: 'bird', translation: 'con chim', ipa: '/bɜːrd/' },
      { word: 'girl', translation: 'cô gái', ipa: '/ɡɜːrl/' },
      { word: 'shirt', translation: 'áo sơ mi', ipa: '/ʃɜːrt/' },
      { word: 'learn', translation: 'học tập', ipa: '/lɜːrn/' }
    ]
  }
];

// Consonant Blends Data
const BLENDS_DATA: PhonicsBlend[] = [
  {
    blend: 'bl',
    sound: '/bl/',
    explanation: 'Bật nhẹ âm /b/ rồi chuyển nhanh sang âm /l/ không đứt quãng.',
    vietnameseTrick: 'Đọc giống ghép chữ "bờ" lướt nhanh với "lờ". Gần giống "b-lờ".',
    examples: [
      { word: 'black', translation: 'màu đen', ipa: '/blæk/' },
      { word: 'blue', translation: 'màu xanh dương', ipa: '/bluː/' },
      { word: 'blow', translation: 'thổi', ipa: '/bloʊ/' },
      { word: 'blind', translation: 'mù, rèm cửa', ipa: '/blaɪnd/' }
    ]
  },
  {
    blend: 'cl',
    sound: '/kl/',
    explanation: 'Bật âm /k/ từ cổ họng và uốn ngay đầu lưỡi lên phát âm /l/.',
    vietnameseTrick: 'Phát âm "khờ" cực nhanh rồi nối ngay vào "lờ". Gần giống "cờ-lờ" lướt.',
    examples: [
      { word: 'clean', translation: 'sạch sẽ', ipa: '/kliːn/' },
      { word: 'clock', translation: 'đồng hồ', ipa: '/klɒk/' },
      { word: 'class', translation: 'lớp học', ipa: '/klɑːs/' },
      { word: 'cloud', translation: 'đám mây', ipa: '/klaʊd/' }
    ]
  },
  {
    blend: 'fl',
    sound: '/fl/',
    explanation: 'Thổi hơi nhẹ âm /f/ rồi nhanh chóng nối vào âm /l/.',
    vietnameseTrick: 'Cắn môi thổi hơi "phờ" rồi uốn lưỡi "lờ". Gần giống "phờ-lờ" lướt.',
    examples: [
      { word: 'flower', translation: 'bông hoa', ipa: '/ˈflaʊ.ər/' },
      { word: 'fly', translation: 'bay', ipa: '/flaɪ/' },
      { word: 'flat', translation: 'phẳng, căn hộ', ipa: '/flæt/' },
      { word: 'flag', translation: 'lá cờ', ipa: '/flæɡ/' }
    ]
  },
  {
    blend: 'gr',
    sound: '/ɡr/',
    explanation: 'Bật âm /ɡ/ từ họng kết hợp rụt lưỡi phát âm âm rung /r/.',
    vietnameseTrick: 'Phát âm "gờ" sâu ở họng rồi cong lưỡi rung "rờ". Gần giống "gờ-rờ" lướt.',
    examples: [
      { word: 'green', translation: 'màu xanh lá', ipa: '/ɡriːn/' },
      { word: 'grass', translation: 'bãi cỏ', ipa: '/ɡrɑːs/' },
      { word: 'grapes', translation: 'quả nho', ipa: '/ɡreɪps/' },
      { word: 'grow', translation: 'phát triển', ipa: '/ɡroʊ/' }
    ]
  },
  {
    blend: 'st',
    sound: '/st/',
    explanation: 'Xì hơi âm /s/ nhẹ sau đó chặn lại để bật âm /t/.',
    vietnameseTrick: 'Độc chiêu: Xì hơi "s..." thật nhẹ rồi bật ngay "tờ". Gần giống "xì-tờ" lướt nhanh.',
    examples: [
      { word: 'star', translation: 'ngôi sao', ipa: '/stɑːr/' },
      { word: 'stop', translation: 'dừng lại', ipa: '/stɒp/' },
      { word: 'student', translation: 'học sinh', ipa: '/ˈstjuː.dənt/' },
      { word: 'stone', translation: 'hòn đá', ipa: '/stoʊn/' }
    ]
  },
  {
    blend: 'br',
    sound: '/br/',
    explanation: 'Mím môi bật hơi âm /b/ rồi lập tức chuyển sang uốn lưỡi phát âm /r/.',
    vietnameseTrick: 'Mím môi bật "bờ" rồi uốn lưỡi đọc rung "rờ". Gần giống "bờ-rờ" lướt siêu tốc.',
    examples: [
      { word: 'brown', translation: 'màu nâu', ipa: '/braʊn/' },
      { word: 'bread', translation: 'bánh mì', ipa: '/bred/' },
      { word: 'bridge', translation: 'cây cầu', ipa: '/brɪdʒ/' },
      { word: 'bring', translation: 'mang lại', ipa: '/brɪŋ/' }
    ]
  }
];

// Digraphs / Letter Combinations Data
const DIGRAPHS_DATA: DigraphCombination[] = [
  {
    combination: 'ch',
    sound: '/tʃ/',
    explanation: 'Chu môi tròn, đặt đầu lưỡi sau răng cửa trên rồi giật hàm mạnh xuống và thổi hơi ra.',
    vietnameseTrick: 'Đọc giống chữ "Chờ" nặng uốn môi uốn lưỡi, bật luồng hơi gió cực mạnh ra ngoài.',
    examples: [
      { word: 'chair', translation: 'cái ghế', ipa: '/tʃeər/' },
      { word: 'beach', translation: 'bãi biển', ipa: '/biːtʃ/' },
      { word: 'teacher', translation: 'giáo viên', ipa: '/ˈtiː.tʃər/' },
      { word: 'children', translation: 'trẻ em', ipa: '/ˈtʃɪl.drən/' }
    ]
  },
  {
    combination: 'sh',
    sound: '/ʃ/',
    explanation: 'Chu môi tròn hết cỡ như đang ra hiệu giữ trật tự "Suỵt!", đẩy luồng hơi mạnh và liên tục.',
    vietnameseTrick: 'Đọc giống âm "Sờ" uốn lưỡi thật nặng. Thổi hơi liên tục "shhh..." giống tiếng xì ga.',
    examples: [
      { word: 'she', translation: 'cô ấy', ipa: '/ʃiː/' },
      { word: 'ship', translation: 'tàu thủy', ipa: '/ʃɪp/' },
      { word: 'fish', translation: 'con cá', ipa: '/fɪʃ/' },
      { word: 'shoes', translation: 'đôi giày', ipa: '/ʃuːz/' }
    ]
  },
  {
    combination: 'th (vô thanh)',
    sound: '/θ/',
    explanation: 'Đặt đầu lưỡi ở giữa hai hàm răng cửa, rồi thổi luồng hơi nhẹ qua khe răng (không rung cổ họng).',
    vietnameseTrick: 'Độc chiêu thè lưỡi: Đưa đầu lưỡi kẹp nhẹ giữa hai hàm răng rồi thổi hơi ra tạo từ "thờ" gió.',
    examples: [
      { word: 'thin', translation: 'gầy, mỏng', ipa: '/θɪn/' },
      { word: 'think', translation: 'suy nghĩ', ipa: '/θɪŋk/' },
      { word: 'thank', translation: 'cảm ơn', ipa: '/θæŋk/' },
      { word: 'three', translation: 'số ba', ipa: '/θriː/' }
    ]
  },
  {
    combination: 'th (hữu thanh)',
    sound: '/ð/',
    explanation: 'Đặt đầu lưỡi ở giữa răng cửa, đẩy hơi ra đồng thời làm rung mạnh dây thanh quản ở cổ.',
    vietnameseTrick: 'Cũng đưa đầu lưỡi kẹp răng cửa nhưng vừa rung họng phát tiếng "dờ/đờ". Gần giống "đờ" thè lưỡi.',
    examples: [
      { word: 'this', translation: 'cái này', ipa: '/ðɪs/' },
      { word: 'mother', translation: 'mẹ', ipa: '/ˈmʌð.ər/' },
      { word: 'father', translation: 'bố', ipa: '/ˈfɑː.ðər/' },
      { word: 'brother', translation: 'anh em trai', ipa: '/ˈbrʌð.ər/' }
    ]
  },
  {
    combination: 'ph',
    sound: '/f/',
    explanation: 'Răng cửa hàm trên chạm nhẹ vào môi dưới, thổi hơi ra giống y hệt chữ F tiếng Anh.',
    vietnameseTrick: 'Đọc hoàn toàn giống chữ "Phờ" trong tiếng Việt vô cùng dễ thở.',
    examples: [
      { word: 'phone', translation: 'điện thoại', ipa: '/foʊn/' },
      { word: 'photo', translation: 'bức ảnh', ipa: '/ˈfoʊ.toʊ/' },
      { word: 'dolphin', translation: 'cá heo', ipa: '/ˈdɒl.fɪn/' },
      { word: 'alphabet', translation: 'bảng chữ cái', ipa: '/ˈæl.fə.bet/' }
    ]
  },
  {
    combination: 'ng',
    sound: '/ŋ/',
    explanation: 'Âm mũi. Phần sau lưỡi nâng lên chạm vòm họng mềm, chặn hơi rồi cho hơi thoát ra đường mũi.',
    vietnameseTrick: 'Đọc giống âm "ngờ" cuối chữ "bóng" hay "xinh", ngân nhẹ giọng lên mũi.',
    examples: [
      { word: 'sing', translation: 'hát', ipa: '/sɪŋ/' },
      { word: 'king', translation: 'vua', ipa: '/kɪŋ/' },
      { word: 'song', translation: 'bài hát', ipa: '/sɒŋ/' },
      { word: 'learning', translation: 'học tập', ipa: '/ˈlɜː.nɪŋ/' }
    ]
  },
  {
    combination: 'kn',
    sound: '/n/',
    explanation: 'Âm câm! Chữ K đứng trước chữ N sẽ hoàn toàn bị biến mất, chỉ phát âm âm /n/.',
    vietnameseTrick: 'Phớt lờ chữ K câm nín! Con chỉ cần phát âm chữ "Nờ" như tiếng Việt bình thường.',
    examples: [
      { word: 'know', translation: 'biết', ipa: '/noʊ/' },
      { word: 'knee', translation: 'đầu gối', ipa: '/niː/' },
      { word: 'knife', translation: 'con dao', ipa: '/naɪf/' },
      { word: 'knight', translation: 'hiệp sĩ', ipa: '/naɪt/' }
    ]
  }
];

// Combine all words for the Spelling game
const ALL_PRACTICE_WORDS = [
  { word: 'apple', ipa: '/ˈæp.əl/', viPhonics: 'Ép-pờ', hint: 'Quả táo màu đỏ ngọt ngào', soundType: 'Chữ cái A', trick: 'Nghĩ tới "ép quả táo lấy nước" để nhớ cách đọc "Ép-pờ".' },
  { word: 'cat', ipa: '/kæt/', viPhonics: 'Khét / Cát', hint: 'Con vật kêu meo meo thích bắt chuột', soundType: 'Nguyên âm ngắn /æ/', trick: 'Há miệng thật to dẹt khóe môi nói chữ lai giữa Ca và E dứt khoát.' },
  { word: 'sheep', ipa: '/ʃiːp/', viPhonics: 'Sh-íp (kéo dài)', hint: 'Con vật có lông dày màu trắng tinh', soundType: 'Nguyên âm dài /iː/', trick: 'Cười thật tươi kéo dài âm "i" rồi mím môi lại.' },
  { word: 'black', ipa: '/blæk/', viPhonics: 'B-lét-kh', hint: 'Màu đen huyền bí', soundType: 'Tổ hợp phụ âm "bl"', trick: 'Đọc nhanh lướt "bờ-lét" rồi khạc nhẹ hơi "k" ở cuối cổ họng.' },
  { word: 'chair', ipa: '/tʃeər/', viPhonics: 'Ch-e-ờ', hint: 'Vật dụng dùng để ngồi học bài', soundType: 'Tổ hợp chữ cái "ch"', trick: 'Chu tròn môi bật hơi chữ "Ch" uốn lưỡi lướt nhanh sang e-ờ.' },
  { word: 'ship', ipa: '/ʃɪp/', viPhonics: 'Sh-íp (ngắn)', hint: 'Phương tiện giao thông chạy trên biển khơi', soundType: 'Tổ hợp chữ cái "sh"', trick: 'Chu môi uốn lưỡi âm "sh" nặng rồi nói "íp" dứt khoát hụt hơi từ bụng.' },
  { word: 'star', ipa: '/stɑːr/', viPhonics: 'S-ta-ờ', hint: 'Vật lấp lánh trên bầu trời đêm', soundType: 'Tổ hợp phụ âm "st"', trick: 'Xì nhẹ "s..." rồi nói "ta" kéo dài và rụt đầu lưỡi vào trong họng.' },
  { word: 'milk', ipa: '/mɪlk/', viPhonics: 'Meo-kh', hint: 'Thức uống dinh dưỡng có màu trắng', soundType: 'Nguyên âm ngắn /ɪ/', trick: 'Đọc là "miu-kh" lướt âm "l" uốn lưỡi và bật nhẹ âm "k" ở cuối cổ họng.' },
  { word: 'green', ipa: '/ɡriːn/', viPhonics: 'G-rin', hint: 'Màu xanh của lá cây', soundType: 'Tổ hợp phụ âm "gr"', trick: 'Nói "gờ" siêu tốc không phát tiếng rồi nối vào "rin" kéo dài.' },
  { word: 'phone', ipa: '/fəʊn/', viPhonics: 'Phơ-un', hint: 'Vật dùng để nghe gọi và lướt web', soundType: 'Tổ hợp chữ cái "ph"', trick: 'Phát âm "Phờ" rồi lướt "ơ-un" ra âm ngân ở mũi. Gần giống "Phôn".' },
  { word: 'learn', ipa: '/lɜːn/', viPhonics: 'Lơ-ờ-n', hint: 'Hoạt động con đang làm để giỏi tiếng Anh hơn', soundType: 'Nguyên âm dài /ɜː/', trick: 'Đọc chữ "lơ" kéo dài kết hợp cong rụt lưỡi rồi ngân âm "nờ" nhẹ.' },
  { word: 'knee', ipa: '/niː/', viPhonics: 'Ni-i', hint: 'Bộ phận cơ thể ở chân giúp gập đầu gối', soundType: 'Tổ hợp câm "kn"', trick: 'Bỏ qua chữ K bị câm hoàn toàn, chỉ kéo dài âm "ni" cười tươi.' }
];

interface PhonicsMasterProps {
  onEarnPoints: (points: number) => void;
}

export default function PhonicsMaster({ onEarnPoints }: PhonicsMasterProps) {
  const [subTab, setSubTab] = useState<'alphabet' | 'vowels' | 'blends' | 'digraphs' | 'decoding' | 'game'>('alphabet');
  
  // Game states
  const [gameIndex, setGameIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [revealedHint, setRevealedHint] = useState(false);

  // Text to speech helpers
  const playTTS = (text: string, isLetter = false) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = isLetter ? 0.6 : 0.8; // speak letters slower

      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Google')) ||
                    voices.find(v => v.lang.startsWith('en-')) ||
                    voices[0];
      if (voice) {
        utterance.voice = voice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSpellLetterByLetter = (word: string) => {
    const letters = word.toUpperCase().split('');
    let index = 0;

    const speakNextLetter = () => {
      if (index < letters.length) {
        playTTS(letters[index], true);
        index++;
        setTimeout(speakNextLetter, 900); // interval between letters
      } else {
        // Finally speak the whole word
        setTimeout(() => playTTS(word, false), 1000);
      }
    };
    speakNextLetter();
  };

  const currentWordData = ALL_PRACTICE_WORDS[gameIndex];

  // Handle Game Check
  const handleCheckSpelling = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !userInput.trim()) return;

    const answerClean = userInput.trim().toLowerCase();
    const correctClean = currentWordData.word.trim().toLowerCase();
    const correct = answerClean === correctClean;

    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setStreak(prev => prev + 1);
      onEarnPoints(15); // +15 points for correct spelling in phonics playground
      // play a quick sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(698.46, audioCtx.currentTime + 0.1); // F5
        osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.2); // A5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch (e) {}
    } else {
      setStreak(0);
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(196.00, audioCtx.currentTime); // G3
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } catch (e) {}
    }
  };

  const handleNextGameWord = () => {
    setUserInput('');
    setIsAnswered(false);
    setIsCorrect(false);
    setRevealedHint(false);
    setGameIndex((prev) => (prev + 1) % ALL_PRACTICE_WORDS.length);
  };

  return (
    <div className="space-y-6">
      {/* Introduction banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-left">
          <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight flex items-center space-x-1.5">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            <span>Phonics & Đánh Vần Tiếng Anh Cơ Bản</span>
          </h2>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-3xl">
            Để học giỏi tiếng Anh, bước quan trọng nhất của học sinh mất gốc là biết **mặt chữ cái, cách phát âm, nguyên âm ngắn/dài, tổ hợp âm** để tự tin tự ghép vần đọc bất kỳ từ vựng nào như tiếng Việt!
          </p>
        </div>
        <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-amber-700 font-extrabold text-xs shrink-0">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Vừa học vừa nhận XP!</span>
        </div>
      </div>

      {/* Internal Subtabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'alphabet', label: '🔠 26 Chữ Cái Tiếng Anh' },
          { id: 'vowels', label: '🗣️ Nguyên Âm Ngắn & Dài' },
          { id: 'blends', label: '🧬 Tổ Hợp Phụ Âm (Blends)' },
          { id: 'digraphs', label: '📖 Tổ Hợp Chữ Cái' },
          { id: 'decoding', label: '🎯 Quy Luật Tách Âm THCS' },
          { id: 'game', label: '🎮 Thử Thách Ghép Vần' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              subTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-100 shadow-sm'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT VIEWS */}
      <div className="animate-in fade-in duration-300">
        {/* ALPHABET WORKBENCH */}
        {subTab === 'alphabet' && (
          <div className="space-y-5 text-left">
            <div className="p-4 bg-blue-50 border border-blue-100/50 rounded-2xl flex items-start space-x-2.5">
              <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900 leading-normal">
                💡 <strong>Hướng dẫn học:</strong> Bấm vào từng thẻ chữ cái dưới đây. Bạn sẽ được nghe **Tên chữ cái**, **Âm Phonics** đặc trưng của nó, và **Từ vựng ví dụ**. Hãy nói nhại theo nhé!
              </p>
            </div>

            {/* Alphabet Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {ALPHABET_DATA.map((item) => (
                <div
                  key={item.letter}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-blue-600 font-sans">{item.letter}</span>
                    <button
                      type="button"
                      title="Nghe đánh vần từng chữ"
                      onClick={() => playTTS(item.letter, true)}
                      className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div>
                      Tên gọi: <strong className="text-slate-800 font-bold">{item.pronunciation}</strong>
                    </div>
                    <div>
                      Phát âm: <strong className="text-amber-600 font-bold">{item.sound}</strong>
                    </div>
                    <div className="bg-amber-50 text-amber-800 text-[10px] p-2 rounded-xl leading-relaxed mt-1.5 border border-amber-100/50">
                      <strong>Mẹo nhớ:</strong> {item.vietnameseTrick}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-extrabold text-xs text-slate-700">{item.example}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.exampleTranslation}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => playTTS(item.example, false)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                      title="Nghe phát âm từ ví dụ"
                    >
                      <Play className="w-3 h-3 fill-blue-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SHORT & LONG VOWELS WORKBENCH */}
        {subTab === 'vowels' && (
          <div className="space-y-6 text-left">
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <p className="text-xs text-amber-900 leading-normal">
                👅 <strong>Bí kíp phát âm Nguyên Âm:</strong> Nguyên âm ngắn phát âm dứt khoát dưới 1 giây. Nguyên âm dài cần chu môi hoặc kéo dài hơi ra từ 1.5 - 2 giây (kí hiệu có dấu hai chấm <strong>:</strong> ở cuối).
              </p>
            </div>

            {/* Short Vowels Grid */}
            <div className="space-y-4">
              <h3 className="font-black text-slate-800 text-sm border-l-4 border-emerald-500 pl-2">1. Nguyên Âm Ngắn (Short Vowels)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VOWELS_DATA.filter(v => v.type === 'short').map((vowel, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-emerald-600">{vowel.sound}</span>
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full">Nguyên âm ngắn</span>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed">{vowel.mouthShape}</p>
                      {vowel.vietnameseTrick && (
                        <div className="bg-amber-50 text-amber-800 text-[10px] p-2 rounded-xl leading-relaxed mt-1.5 border border-amber-100/50">
                          <strong>Mẹo nhớ:</strong> {vowel.vietnameseTrick}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Ví dụ luyện nói:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {vowel.examples.map((ex, eIdx) => (
                          <div key={eIdx} className="bg-slate-50 hover:bg-blue-50/50 p-2 rounded-xl flex items-center justify-between border border-slate-100 transition-colors">
                            <div className="text-left">
                              <div className="flex flex-wrap items-baseline gap-1">
                                <p className="font-extrabold text-xs text-slate-800 capitalize">{ex.word}</p>
                                {ex.ipa && <p className="text-[10px] text-indigo-600 font-medium font-mono">{ex.ipa}</p>}
                              </div>
                              <p className="text-[10px] text-slate-400">{ex.translation}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => playTTS(ex.word, false)}
                              className="p-1 bg-white hover:bg-blue-100 text-blue-600 rounded shadow-sm"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Long Vowels Grid */}
            <div className="space-y-4 pt-4">
              <h3 className="font-black text-slate-800 text-sm border-l-4 border-indigo-500 pl-2">2. Nguyên Âm Dài (Long Vowels)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VOWELS_DATA.filter(v => v.type === 'long').map((vowel, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-indigo-600">{vowel.sound}</span>
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-800 px-2.5 py-0.5 rounded-full">Nguyên âm dài</span>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed">{vowel.mouthShape}</p>
                      {vowel.vietnameseTrick && (
                        <div className="bg-amber-50 text-amber-800 text-[10px] p-2 rounded-xl leading-relaxed mt-1.5 border border-amber-100/50">
                          <strong>Mẹo nhớ:</strong> {vowel.vietnameseTrick}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Ví dụ luyện nói:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {vowel.examples.map((ex, eIdx) => (
                          <div key={eIdx} className="bg-slate-50 hover:bg-blue-50/50 p-2 rounded-xl flex items-center justify-between border border-slate-100 transition-colors">
                            <div className="text-left">
                              <div className="flex flex-wrap items-baseline gap-1">
                                <p className="font-extrabold text-xs text-slate-800 capitalize">{ex.word}</p>
                                {ex.ipa && <p className="text-[10px] text-indigo-600 font-medium font-mono">{ex.ipa}</p>}
                              </div>
                              <p className="text-[10px] text-slate-400">{ex.translation}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => playTTS(ex.word, false)}
                              className="p-1 bg-white hover:bg-blue-100 text-blue-600 rounded shadow-sm"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONSONANT BLENDS WORKBENCH */}
        {subTab === 'blends' && (
          <div className="space-y-5 text-left">
            <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl">
              <p className="text-xs text-sky-900 leading-normal">
                🌀 <strong>Tổ hợp phụ âm (Consonant Blends):</strong> Là hiện tượng hai phụ âm đi cạnh nhau nhưng ta vẫn đọc lướt nhanh cả hai âm kết hợp lại, không được bỏ quên âm nào. Cực kỳ quan trọng để chuẩn giọng Mỹ!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {BLENDS_DATA.map((item, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-black text-sky-600">"{item.blend}"</span>
                      <span className="text-xs font-bold text-slate-400">({item.sound})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => playTTS(item.blend, true)}
                      className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 text-[10px] font-extrabold rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Âm mẫu</span>
                    </button>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">{item.explanation}</p>
                  {item.vietnameseTrick && (
                    <div className="bg-amber-50 text-amber-800 text-[10px] p-2 rounded-xl leading-relaxed border border-amber-100/50">
                      <strong>Mẹo nhớ:</strong> {item.vietnameseTrick}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-50 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Từ vựng điển hình:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {item.examples.map((ex, eIdx) => (
                        <div key={eIdx} className="bg-slate-50 p-2 rounded-xl flex items-center justify-between border border-slate-100">
                          <div className="text-left">
                            <div className="flex flex-wrap items-baseline gap-1">
                              <p className="font-extrabold text-xs text-slate-800 capitalize">{ex.word}</p>
                              {ex.ipa && <p className="text-[10px] text-indigo-600 font-medium font-mono">{ex.ipa}</p>}
                            </div>
                            <p className="text-[10px] text-slate-400">{ex.translation}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => playTTS(ex.word, false)}
                            className="p-1 bg-white hover:bg-blue-100 text-blue-600 rounded shadow-sm"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DIGRAPHS & LETTER COMBINATIONS */}
        {subTab === 'digraphs' && (
          <div className="space-y-5 text-left">
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl">
              <p className="text-xs text-purple-900 leading-normal">
                🧩 <strong>Tổ hợp chữ cái (Digraphs):</strong> Khi hai chữ cái đứng cạnh nhau và biến đổi để tạo ra một âm hoàn toàn mới (ví dụ: Chữ "s" đứng cạnh "h" tạo thành âm suỵt /ʃ/). Hãy ghi nhớ các trường hợp đặc biệt này để tránh phát âm kiểu "Việt hóa" nhé!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {DIGRAPHS_DATA.map((item, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-black text-purple-600">"{item.combination}"</span>
                      <span className="text-xs font-bold text-slate-400">({item.sound})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => playTTS(item.combination.split(' ')[0], true)}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-extrabold rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Âm mẫu</span>
                    </button>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">{item.explanation}</p>
                  {item.vietnameseTrick && (
                    <div className="bg-amber-50 text-amber-800 text-[10px] p-2 rounded-xl leading-relaxed border border-amber-100/50">
                      <strong>Mẹo nhớ:</strong> {item.vietnameseTrick}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-50 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Từ vựng điển hình:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {item.examples.map((ex, eIdx) => (
                        <div key={eIdx} className="bg-slate-50 p-2 rounded-xl flex items-center justify-between border border-slate-100">
                          <div className="text-left">
                            <div className="flex flex-wrap items-baseline gap-1">
                              <p className="font-extrabold text-xs text-slate-800 capitalize">{ex.word}</p>
                              {ex.ipa && <p className="text-[10px] text-indigo-600 font-medium font-mono">{ex.ipa}</p>}
                            </div>
                            <p className="text-[10px] text-slate-400">{ex.translation}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => playTTS(ex.word, false)}
                            className="p-1 bg-white hover:bg-blue-100 text-blue-600 rounded shadow-sm"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SYLLABLE DECODING & PHONICS RULES WORKBENCH */}
        {subTab === 'decoding' && (
          <div className="space-y-6 text-left">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl shadow-lg space-y-2">
              <h3 className="font-black text-lg tracking-tight text-amber-400 flex items-center space-x-2">
                <span>🎯 Nguyên Tắc Vàng Tách Âm & Trọng Âm THCS</span>
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                Khi gặp một từ mới dài (ví dụ: <code>environment</code> hay <code>congratulation</code>), con đừng hoảng sợ! Hãy áp dụng đúng 4 bước bóc tách quy luật sau để tự nhìn mặt chữ là tự đọc được mà không cần phụ thuộc phiên âm:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
                <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg text-xs font-black">Quy Luật 1: Luôn Tìm Trọng Âm Trước</span>
                <p className="text-xs text-slate-700 leading-normal">
                  Mỗi từ tiếng Anh chỉ có **1 âm tiết quan trọng nhất (Trọng âm chính)**. Khi đọc, ta phải lên giọng cao ở âm này giống như thêm **dấu sắc** trong tiếng Việt (VD: <code>por</code> đọc là <code>pó</code>). Các âm không nhấn trọng âm xung quanh phải đọc lướt nhẹ nhàng xuống giọng như thêm **dấu huyền hoặc ngang** (VD: <code>im</code> ➔ <code>ìm</code>).
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
                <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-black">Quy Luật 2: Nhìn Đuôi Nhận Biết Trọng Âm</span>
                <p className="text-xs text-slate-700 leading-normal">
                  - Các từ kết thúc bằng đuôi <strong>-tion, -sion, -ic, -ial, -ian</strong>: Trọng âm luôn luôn rơi vào âm tiết **ngay phía trước nó** (VD: <code>educa<strong>tion</strong></code> ➔ nhấn vào <code>ca</code>).<br/>
                  - Đuôi <strong>-ment, -ness, -ful, -ly, -er, -or</strong>: Là các hậu tố bổ sung, không bao giờ nhận trọng âm.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
                <span className="bg-indigo-100 text-indigo-900 px-2.5 py-1 rounded-lg text-xs font-black">Quy Luật 3: Nguyên Âm + Phụ Âm + "e" câm</span>
                <p className="text-xs text-slate-700 leading-normal">
                  Khi từ kết thúc bằng một nguyên âm đứng trước phụ âm và cuối cùng là chữ <code>e</code> (VD: <code>k<strong>ite</strong></code>, <code>c<strong>ake</strong></code>, <code>h<strong>ome</strong></code>): Chữ <code>e</code> ở cuối bị câm hoàn toàn, nhưng có phép thuật làm nguyên âm đứng trước nó đọc dài ra theo đúng tên gọi trong bảng chữ cái!
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
                <span className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg text-xs font-black">Quy Luật 4: Ghép Vần Từ Âm Quan Trọng</span>
                <p className="text-xs text-slate-700 leading-normal">
                  <strong>Thứ tự đọc chuẩn THCS:</strong> Đừng đọc từ trái sang phải đều đều như đọc tiếng Việt! Hãy nhìn vào từ, định vị Trọng âm chính đọc trước, sau đó phát âm nối các âm đầu và âm đuôi nhẹ nhàng vào sau. Ví dụ: <code>con - <strong>GRAT</strong> - u - la - tion</code> ➔ đọc <code>GRÁT</code> trước ➔ rồi nối <code>cờn - grát - chờ - lây - shờn</code>.
                </p>
              </div>
            </div>

            {/* SECTION: IPA TRANSCRIPTION RULES */}
            <div className="p-5 bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-3xl shadow-lg space-y-2">
              <h3 className="font-black text-lg tracking-tight text-purple-300 flex items-center space-x-2">
                <span>📖 Quy Luật Tách Phiên Âm Quốc Tế (IPA) & Đọc Trọng Âm Trong Phiên Âm</span>
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                Khi con tra từ điển thấy dòng chữ bọc trong dấu gạch chéo <code>/.../</code> (Ví dụ: <code>/ɪnˈvaɪ.rən.mənt/</code>), đó chính là Bản đồ âm thanh IPA! Hãy giải mã ký hiệu theo 3 quy tắc vàng:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 space-y-2">
                <span className="bg-purple-600 text-white px-2.5 py-1 rounded-lg text-xs font-black block w-max">1. Dấu Chấm (.) Tách Âm</span>
                <p className="text-xs text-slate-700 leading-normal">
                  Trong phiên âm IPA, dấu chấm <code>.</code> được dùng để cắt từ thành các phần nhỏ (âm tiết). Ví dụ: <code>/ɪn . vaɪ . rən . mənt/</code> bị cắt bởi 3 dấu chấm ➔ từ này có **4 âm tiết**.
                </p>
              </div>

              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 space-y-2">
                <span className="bg-rose-600 text-white px-2.5 py-1 rounded-lg text-xs font-black block w-max">2. Dấu Nhấn (ˈ) Trọng Âm Chính</span>
                <p className="text-xs text-slate-700 leading-normal">
                  Ký hiệu giống dấu phẩy trên cao <code>ˈ</code> luôn đứng **ngay trước** âm tiết quan trọng nhất. Khi đọc, ta phải lập tức ngân to và cao giọng như thêm **Dấu Sắc** (VD: thấy <code>ˈvaɪ</code> phải đọc là <code>VÁI</code>).
                </p>
              </div>

              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 space-y-2">
                <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-xs font-black block w-max">3. Âm Không Nhấn Đọc Lướt</span>
                <p className="text-xs text-slate-700 leading-normal">
                  Tất cả các âm tiết còn lại không có dấu <code>ˈ</code> ở trước thì tuyệt đối không được đọc ngang phè! Ta phải hạ thấp giọng lướt nhanh như thêm **Dấu Huyền hoặc Ngang** (VD: <code>/ɪn/</code> ➔ <code>ìn</code>, <code>/mənt/</code> ➔ <code>mờn</code>).
                </p>
              </div>
            </div>

            {/* Live practice demo box */}
            <div className="bg-amber-50/60 p-6 rounded-3xl border-2 border-amber-200 space-y-4">
              <span className="text-xs font-black text-amber-800 uppercase tracking-wider block">🗣️ Thử nghiệm thực hành bóc tách mẫu:</span>
              <div className="bg-white p-4 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-2xl font-black text-slate-900 font-mono tracking-wide">/ɪn • <span className="text-rose-600 font-black">ˈvaɪ</span> • rən • mənt/</h4>
                  <p className="text-xs text-slate-500 pt-1">Tách 4 phần qua dấu chấm: <code>ɪn</code> - <code>vaɪ</code> - <code>rən</code> - <code>mənt</code>. Nhìn dấu <code>ˈ</code> trước <code>vaɪ</code> đọc <code>VÁI</code> trước ➔ nối liền: <code>ìn - VÁI - rơn - mờn</code>.</p>
                </div>
                <button
                  onClick={() => playTTS('environment', false)}
                  className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs shrink-0 flex items-center space-x-2 shadow-md"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Nghe Ghép Vần Chuẩn</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SPELLING GAME PLAYGROUND */}
        {subTab === 'game' && (
          <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border border-slate-100 shadow-lg text-center space-y-6">
            <div className="space-y-1">
              <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase rounded-full tracking-widest inline-block">
                Spelling & Phonics Training Game
              </span>
              <h3 className="text-xl font-black text-slate-800">Thử Thách Đánh Vần Tiếng Anh</h3>
              <p className="text-slate-500 text-xs">
                Hãy nghe kỹ cách cô giáo phát âm/đánh vần rồi nhập chính xác từ vựng vào ô trống nhé!
              </p>
            </div>

            {/* Streak count */}
            <div className="flex justify-center items-center space-x-1 text-sm font-extrabold text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full w-max mx-auto border border-orange-100">
              <span>Chuỗi đúng liên tiếp: {streak} 🔥</span>
            </div>

            {/* Main Interactive Box */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-5">
              <div className="space-y-1 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chủ đề bài học:</span>
                <p className="text-xs font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-max mx-auto">
                  {currentWordData.soundType}
                </p>
              </div>

              {/* Speech simulator play triggers */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                <button
                  type="button"
                  onClick={() => playTTS(currentWordData.word, false)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-blue-100"
                >
                  <Volume2 className="w-4 h-4 text-white" />
                  <span>1. Nghe Phát Âm Từ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSpellLetterByLetter(currentWordData.word)}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-extrabold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-amber-100"
                >
                  <Play className="w-4 h-4 text-slate-900" />
                  <span>2. Nghe Đánh Vần Từng Chữ Cái</span>
                </button>
              </div>

              {/* Letters clue */}
              <div className="pt-2">
                <p className="text-slate-400 text-xs font-semibold">Gợi ý độ dài từ:</p>
                <div className="flex justify-center gap-1.5 mt-1.5">
                  {currentWordData.word.split('').map((char, index) => (
                    <span
                      key={index}
                      className="w-7 h-9 bg-white border border-slate-200 text-slate-700 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm"
                    >
                      {isAnswered ? char : '_'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hint toggler */}
              <div className="pt-1">
                {revealedHint ? (
                  <div className="space-y-2 text-left pl-4 border-l-2 border-amber-400">
                    <p className="text-xs text-slate-600 leading-normal">
                      💡 <strong>Ý nghĩa:</strong> {currentWordData.hint}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md">
                        Phiên âm IPA: {currentWordData.ipa}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded-md">
                        Gần giống: "{currentWordData.viPhonics}"
                      </span>
                    </div>
                    {currentWordData.trick && (
                      <p className="text-[10px] text-amber-700 italic font-medium leading-relaxed bg-amber-50/50 p-2 rounded-xl border border-amber-100/30">
                        🎯 <strong>Mẹo ghi nhớ:</strong> {currentWordData.trick}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRevealedHint(true)}
                    className="text-xs text-blue-600 hover:underline font-bold"
                  >
                    🔍 Xem gợi ý nghĩa, phiên âm và mẹo nhớ của từ
                  </button>
                )}
              </div>
            </div>

            {/* Answer input form */}
            <form onSubmit={handleCheckSpelling} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
                <input
                  type="text"
                  autoFocus
                  required
                  disabled={isAnswered}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Nhập từ con nghe được..."
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-center text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest"
                />
                <button
                  type="submit"
                  disabled={isAnswered || !userInput.trim()}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all disabled:opacity-50"
                >
                  Kiểm tra
                </button>
              </div>

              {/* Feedback after answer */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`p-4 rounded-2xl border text-left ${
                      isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-rose-50 border-rose-100 text-rose-900'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5 text-xs">
                      <div className={`p-1 rounded-full shrink-0 ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </div>
                      <div className="space-y-2">
                        <p className="font-extrabold">
                          {isCorrect ? 'Hoàn toàn chính xác! Con đỉnh quá! +15 XP 🚀' : 'Chưa đúng rồi con ơi! Thử lại lần sau nhé.'}
                        </p>
                        <p className="text-[11px] text-slate-600 leading-normal">
                          Từ đúng là: <strong className="text-slate-800 font-extrabold uppercase">{currentWordData.word}</strong> • Ý nghĩa: <strong>{currentWordData.hint}</strong>
                        </p>
                        <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100/50 space-y-1 text-[10px]">
                          <div><strong>Phiên âm Quốc tế (IPA):</strong> <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-bold">{currentWordData.ipa}</code></div>
                          <div><strong>Phát âm kiểu Việt dễ nhớ:</strong> <strong className="text-amber-700 font-bold">"{currentWordData.viPhonics}"</strong></div>
                          {currentWordData.trick && (
                            <div className="text-slate-500 pt-0.5">💡 {currentWordData.trick}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        type="button"
                        onClick={handleNextGameWord}
                        className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg transition-all hover:bg-slate-800 flex items-center space-x-1"
                      >
                        <span>Từ tiếp theo</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
