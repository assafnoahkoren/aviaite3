import { Stack, Title, Text, Paper, Checkbox, ScrollArea, Box } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from '../OnboardingPage.module.scss';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};


const paperVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      delay: 0.5,
      duration: 0.5,
      ease: 'backOut',
    },
  },
};

const checkboxVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.5,
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const tosContent = `
## **הצהרת פרטיות ותנאי שימוש \- גרסת BETA** 

### **תקציר חשוב (TL;DR):**

* זהו מוצר BETA – ייתכנו בו שגיאות, חוסרים או אי דיוקים.

* אין להסתמך עליו כמקור יחיד או סופי בקבלת החלטות מבצעיות.

* אתה נדרש לאשר שאתה טייס מוסמך, מקצועי ומבין את מגבלות הכלי.

* הנתונים שאתה מזין לא ישותפו עם צדדים שלישיים – אך עשויים לשמש לשיפור הבטיחות ודיוק המערכת.  
---

### **1. כללי**

מוצר זה מסופק כשירות BETA מוגבל ("השירות") לטייסים מוסמכים בצי של אל על, ומהווה כלי עזר בלבד שאינו מחליף מסמכי מקור מחייבים (כגון FCOM, MEL, OM-A וכו’). השימוש בשירות כפוף לתנאים המפורטים להלן ומהווה הסכמה להם.

---

### **2. אחריות המשתמש**

* המשתמש מצהיר כי הוא טייס מסחרי מוסמך בחברת אל על.  
* המשתמש מצהיר כי הוא מורשה להשתמש בחומרים תפעוליים של אל על.  
* המשתמש מתחייב שלא להסתמך על השירות בקבלת החלטות מבצעיות ללא אימות עצמאי במקורות רשמיים.  
* האחריות הבלעדית לכל פעולה או הימנעות מפעולה בעקבות מידע מהשירות מוטלת על המשתמש בלבד.  
---

### **3. מגבלות השירות**

* השירות מבוסס על מסמכי אל על ובואינג העדכניים נכון ליולי 2025\.  
* הוא אינו כולל עדכונים בזמן אמת, אינו מחובר ל-EFB או לשרתים תפעוליים של החברה, ואינו משקף בהכרח את הגרסה העדכנית ביותר של הנהלים.

* התשובות אינן מחליפות ייעוץ מקצועי או הנחיה מבצעית.  
---

### 

### **4. פרטיות ואבטחת מידע**

* המידע שהוזן על-ידי המשתמש (כולל קבצים, מסמכים, שאלות ותשובות) נשמר באופן מקומי ואינו נשלח לצדדים שלישיים.

* מידע עשוי לשמש לניתוח פנימי ולשיפור המערכת, אך לא יזהה את המשתמש אישית.

* לא תתבצע כל מסחר, העברה או מכירה של מידע אישי.  
---

### **5. קניין רוחני**

* המערכת, ממשק המשתמש, האלגוריתמים והתכנים שייכים למפתח השירות.

* אין להעתיק, להפיץ או לפרסם כל חלק מהשירות ללא רשות בכתב.  
---

### **6. שינוי תנאים והפסקת השירות**

* השירות עשוי להשתנות, להפסיק זמנית או לצמיתות, עם או ללא הודעה מוקדמת.

* מפתח השירות רשאי לעדכן את תנאי השימוש בכל עת. שימוש מתמשך לאחר עדכון מהווה הסכמה לתנאים המעודכנים.  
---

### **7. תחום שיפוט**

השירות כפוף לחוקי מדינת ישראל, וכל מחלוקת תידון בבתי המשפט המוסמכים בתל אביב בלבד.

---

### **8. יצירת קשר**

לשאלות, הערות או בקשות להסרת מידע – ניתן לפנות לכתובת הדוא"ל של מפתח השירות tnoy@aviaite.com

`;

interface ReadySlideProps {
  isPilotChecked: boolean;
  isTosChecked: boolean;
  onPilotCheckChange: (checked: boolean) => void;
  onTosCheckChange: (checked: boolean) => void;
}

export function ReadySlide({ 
  isPilotChecked, 
  isTosChecked, 
  onPilotCheckChange, 
  onTosCheckChange 
}: ReadySlideProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Stack className={styles.slideContent}>
        <motion.div variants={itemVariants}>
          <Title order={2}>
            Almost There!
          </Title>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Text size="lg" c="dimmed">
            Please confirm the following before proceeding:
          </Text>
        </motion.div>
        
        <Stack gap="xl" mt="xl">
          <motion.div variants={checkboxVariants}>
            <Paper p="lg" radius="md" withBorder>
              <Checkbox
                checked={isPilotChecked}
                onChange={(event) => onPilotCheckChange(event.currentTarget.checked)}
                label={
                  <Box>
                    <Text fw={500}>I am an active pilot at El Al</Text>
                    <Text size="sm" c="dimmed">
                      I confirm that I am currently employed as a pilot by El Al Airlines
                    </Text>
                  </Box>
                }
                icon={IconCheck}
                size="md"
                color="blue"
              />
            </Paper>
          </motion.div>

          <motion.div variants={checkboxVariants}>
            <Paper p="lg" radius="md" withBorder>
              <Checkbox
                checked={isTosChecked}
                onChange={(event) => onTosCheckChange(event.currentTarget.checked)}
                label={
                  <Box>
                    <Text fw={500}>I accept the Terms of Service</Text>
                    <Text size="sm" c="dimmed">
                      Please read and accept our terms of service below
                    </Text>
                  </Box>
                }
                icon={IconCheck}
                size="md"
                color="blue"
              />
              
              <ScrollArea h={200} mt="md" offsetScrollbars>
                <Paper p="md" bg="gray.0" radius="sm">
                  <Box dir="rtl" className="markdown-body" style={{ fontSize: '0.875rem' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {tosContent}
                    </ReactMarkdown>
                  </Box>
                </Paper>
              </ScrollArea>
            </Paper>
          </motion.div>
        </Stack>
      </Stack>
    </motion.div>
  );
}