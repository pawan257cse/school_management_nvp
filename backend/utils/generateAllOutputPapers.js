const fs = require('fs');
const path = require('path');
const { generateWordDocument } = require('./docxGenerator');

const buildComputerPaperClass4 = () => ({
  class: '4',
  subject: 'Computer',
  examType: 'PA - 1',
  session: '2026-27',
  duration: 90,
  totalMarks: 40,
  language: 'English',
  questions: [
    {
      questionText: 'Choose the Correct Answer',
      marks: 5,
      subQuestions: [
        { label: 'i', text: 'The brain of the computer is:   a) Mouse [   ]   b) CPU [   ]   c) Monitor [   ]' },
        { label: 'ii', text: 'Which one is an output device?   a) Monitor [   ]   b) Scanner [   ]   c) Keyboard [   ]' },
        { label: 'iii', text: 'Which of these is an Operating System?   a) Microsoft Word [   ]   b) Windows [   ]   c) Paint [   ]' },
        { label: 'iv', text: 'A file extension tells you:   a) Size of the file [   ]   b) Type of the file [   ]   c) The date [   ]' },
        { label: 'v', text: 'Which of these is an example of a text file extension?   a) .jpg [   ]   b) .doc [   ]   c) .mp3 [   ]' }
      ]
    },
    {
      questionText: 'Fill in the Blanks',
      marks: 5,
      subQuestions: [
        { label: 'i', text: 'A computer is an __________ machine.' },
        { label: 'ii', text: 'The __________ is the boss of the computer.' },
        { label: 'iii', text: '__________ is used to give input to the computer.' },
        { label: 'iv', text: 'Small pictures on the desktop are called __________.' },
        { label: 'v', text: 'A picture file usually has the extension __________ or __________.' }
      ]
    },
    {
      questionText: 'Write True or False',
      marks: 5,
      subQuestions: [
        { label: 'i', text: 'Desktop screen is where all icons appear. (__________)' },
        { label: 'ii', text: 'OS does not manage how programs run. (__________)' },
        { label: 'iii', text: 'The taskbar is at the bottom of the screen. (__________)' },
        { label: 'iv', text: 'A folder stores many files. (__________)' },
        { label: 'v', text: 'A file can be shared easily. (__________)' }
      ]
    },
    {
      questionText: 'One Word Answers',
      marks: 10,
      subQuestions: [
        { label: 'i', text: 'What is known as the brain of the computer?' },
        { label: 'ii', text: 'Which part of Windows is used to open programs quickly?' },
        { label: 'iii', text: 'What do we call small pictures that open files or programs?' },
        { label: 'iv', text: 'What is a file ?' },
        { label: 'v', text: 'Why do you use folders ?' }
      ]
    },
    {
      questionText: 'Match the Column',
      questionType: 'match',
      marks: 5,
      matchPairs: [
        { left: '.mp3', right: 'Stores files' },
        { left: '.jpg', right: 'Text document' },
        { left: '.doc', right: 'Picture file' },
        { left: 'Folder', right: 'Audio file' },
        { left: 'Windows', right: 'Operating System' }
      ]
    },
    {
      questionText: 'Jumble Words',
      marks: 5,
      subQuestions: [
        { label: 'i', text: 'D L E F O R C - _______________________' },
        { label: 'ii', text: 'L E F I - _______________________' },
        { label: 'iii', text: 'N O I C - _______________________' },
        { label: 'iv', text: 'S V E A - _______________________' },
        { label: 'v', text: 'N S I O T X E N E - _______________________' }
      ]
    },
    {
      questionText: 'Who Am I ?',
      marks: 5,
      subQuestions: [
        { label: 'i', text: 'I come after a dot in a file name. Who am I?' },
        { label: 'ii', text: 'I hold many files together like a school bag. Who am I?' },
        { label: 'iii', text: 'I have keys but no doors. I help you type. Who am I?' },
        { label: 'iv', text: 'I show you pictures, videos and text. Who am I?' },
        { label: 'v', text: 'I can print your homework on paper. Who am I?' }
      ]
    }
  ]
});

const buildHindiPaperClass6 = () => ({
  class: '6',
  subject: 'HINDI',
  examType: 'S.A - 1',
  session: '2026-27',
  duration: 180,
  totalMarks: 60,
  language: 'Hindi',
  questions: [
    {
      questionText: 'अपठित पद्यांश को पढ़कर प्रश्नों के उत्तर दीजिए-',
      marks: 4,
      subQuestions: [
        { label: 'i', text: 'उपर्युक्त पद्यांश में किसकी सवारी आ रही है?' },
        { label: 'ii', text: 'सूर्योदय का दृश्य कैसा लगता है?' },
        { label: 'iii', text: "'पर ठिठकता देखकर यह' पंक्ति से कविता का क्या आशय है?" },
        { label: 'iv', text: "निम्न पद्यांश में से 'फूल' का पर्यायवाची शब्द क्या है?" }
      ]
    },
    {
      questionText: 'निम्न पंक्तियों का आशय स्पष्ट करें-',
      marks: 4,
      subQuestions: [
        { label: '', text: 'हम मेहनतवालों ने जब भी, मिलकर कदम बढ़ाया। सागर ने रास्ता छोड़ा, परबत ने सीस झुकाया।' }
      ]
    },
    {
      questionText: 'निम्न शब्दों के अर्थ लिखो-',
      marks: 3,
      subQuestions: [
        { label: 'i', text: 'ग्लेशियर – ____________' },
        { label: 'ii', text: 'अंतर्वेदना – ____________' },
        { label: 'iii', text: 'सेहरा – ____________' },
        { label: 'iv', text: 'करुणा – ____________' }
      ]
    },
    {
      questionText: 'सही विकल्प पर (✔️) का चिह्न लगाइए-',
      marks: 3,
      subQuestions: [
        { label: 'i', text: 'भारत के कितने प्रतिशत भू-भाग पर वनों का होना आवश्यक है? (क) 22% [ ] (ख) 28% [ ] (ग) 33% [ ] (घ) 35% [ ]' },
        { label: 'ii', text: 'तिलक और परांजपे कहाँ के रहने वाले थे? (क) बंगाल [ ] (ख) महाराष्ट्र [ ] (ग) गुजरात [ ] (घ) बिहार [ ]' },
        { label: 'iii', text: 'मेहनतवालों के सामने कौन सीस झुकाता है? (क) साथी [ ] (ख) सागर [ ] (ग) चट्टान [ ] (घ) पर्वत [ ]' }
      ]
    },
    {
      questionText: 'रिक्त स्थानों की पूर्ति कीजिए-',
      marks: 3,
      subQuestions: [
        { label: 'i', text: 'मोहन का इलाज __________ ने किया।' },
        { label: 'ii', text: 'उसने एक छोटी सी __________ किराये पर ले ली।' },
        { label: 'iii', text: 'पहले के लोग वनों और __________ की रक्षा करते थे।' }
      ]
    },
    {
      questionText: 'सही वाक्य पर (✔️) और गलत वाक्य पर (❌) का चिह्न लगाइए-',
      marks: 3,
      subQuestions: [
        { label: 'i', text: 'सभी जीव-जन्तु पर्यावरण पर आश्रित हैं। [ ]' },
        { label: 'ii', text: 'वनों की घटती संख्या से ऋतुएँ प्रभावित होती हैं। [ ]' },
        { label: 'iii', text: 'बरामदे में एक बड़ा-सा शेर बैठा था। [ ]' }
      ]
    },
    {
      questionText: 'उचित शब्दों से मिलान कीजिए-',
      questionType: 'match',
      marks: 3,
      matchPairs: [
        { left: 'भारत', right: 'सोहन लाल द्विवेदी' },
        { left: 'ऐसे-ऐसे', right: 'विष्णु प्रभाकर' },
        { left: 'साथी हाथ बढ़ाओ', right: 'साहिर लुधियानवी' },
        { left: 'मेहमान की वापसी', right: 'सआदत हसन मंटो' }
      ]
    },
    {
      sectionHeader: 'खण्ड (ब) : व्याकरण एवं रचना',
      questionText: 'दिये गये उपसर्ग से दो-दो नये शब्द बनाओ-',
      marks: 2,
      subQuestions: [
        { label: 'क', text: 'प्र - ____________ , ____________' },
        { label: 'ख', text: 'अन - ____________ , ____________' }
      ]
    },
    {
      questionText: 'निम्न शब्दों का संधि-विच्छेद कीजिए-',
      marks: 2,
      subQuestions: [
        { label: 'i', text: 'अत्यधिक = ____________' },
        { label: 'ii', text: 'नमस्ते = ____________' }
      ]
    },
    {
      questionText: 'दोनों में से कोई एक कहानी लिखिए-',
      marks: 4,
      subQuestions: [
        { label: 'i', text: 'लालच का फल   अथवा   (ii) बन्दर और मगरमच्छ' }
      ]
    },
    {
      questionText: 'पत्र लेखन-',
      marks: 4,
      subQuestions: [
        { label: 'i', text: 'फीस माफ़ी के लिये प्रधानाचार्य को प्रार्थना-पत्र।' }
      ]
    },
    {
      questionText: 'दोनों में से एक पर निबंध लिखिए-',
      marks: 4,
      subQuestions: [
        { label: 'i', text: 'मोबाइल फोन   अथवा   (ii) महात्मा गांधी' }
      ]
    }
  ]
});

const run = async () => {
  console.log('Generating all complete NVP School Question Paper .docx files in output directory...');
  const outputDir = path.join(__dirname, '../../output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Computer Class 4
  const compDoc = await generateWordDocument(buildComputerPaperClass4(), false);
  fs.writeFileSync(path.join(outputDir, 'computer class 4.docx'), compDoc);

  // 2. Hindi Class 6
  const hindiDoc = await generateWordDocument(buildHindiPaperClass6(), false);
  fs.writeFileSync(path.join(outputDir, 'hindi CLASS 6.docx'), hindiDoc);

  console.log('Successfully generated updated .docx files in output folder!');
};

run().catch(console.error);
