package com.example.data

import com.example.model.*

object DataProvider {

    val sampleUser = User(
        name = "Dilmurod Madaminov",
        email = "dilmurod@talabaai.uz",
        studentId = "ST-2024-9921",
        university = "O'zbekiston Milliy Universiteti",
        faculty = "Amaliy Matematika va IT",
        course = 3,
        balance = 420_000,
        isPro = true,
        xpPoints = 2850,
        streakDays = 18
    )

    val subjects: List<Subject> = listOf(
        Subject(
            id = "math",
            name = "Oliy Matematika",
            iconName = "Calculate",
            description = "Chiziqli algebra, matematik analiz, limitlar va differensial",
            questionsCount = 5,
            questions = listOf(
                Question(
                    id = 1,
                    text = "lim (x -> 0) [sin(3x) / x] qiymatini toping:",
                    options = listOf("0", "1", "3", "Cheksiz"),
                    correctAnswer = 2,
                    explanation = "Birinchi ajoyib limit: lim (x->0) sin(kx)/x = k. Demak javob 3."
                ),
                Question(
                    id = 2,
                    text = "f(x) = x^3 - 3x funksiyaning x = 2 nuqtadagi hosilasini hisoblang:",
                    options = listOf("6", "9", "12", "3"),
                    correctAnswer = 1,
                    explanation = "f'(x) = 3x^2 - 3. f'(2) = 3*(4) - 3 = 12 - 3 = 9."
                ),
                Question(
                    id = 3,
                    text = "A = [[2, 1], [3, 4]] matritsaning determinantini toping:",
                    options = listOf("5", "8", "11", "-5"),
                    correctAnswer = 0,
                    explanation = "det(A) = 2*4 - 1*3 = 8 - 3 = 5."
                ),
                Question(
                    id = 4,
                    text = "Integral ∫ (2x + 1) dx qiymati nima?",
                    options = listOf("x^2 + x + C", "2x^2 + C", "x^2 + 2x + C", "2 + C"),
                    correctAnswer = 0,
                    explanation = "∫ 2x dx = x^2, ∫ 1 dx = x. Yig'indi: x^2 + x + C."
                ),
                Question(
                    id = 5,
                    text = "e^(ln 7) ifodaning qiymati nechaga teng?",
                    options = listOf("1", "e", "7", "ln 7"),
                    correctAnswer = 2,
                    explanation = "Asosiy logarifmik ayniyatga ko'ra a^(log_a b) = b, demak 7."
                )
            )
        ),
        Subject(
            id = "physics",
            name = "Umumiy Fizika",
            iconName = "Bolt",
            description = "Klassik mexanika, Nyuton qonunlari, elektr zaryadlari",
            questionsCount = 4,
            questions = listOf(
                Question(
                    id = 101,
                    text = "Nyutonning ikkinchi qonuni formulasini ko'rsating:",
                    options = listOf("F = m * a", "E = m * c^2", "P = U * I", "v = s / t"),
                    correctAnswer = 0,
                    explanation = "Kuch jism massasi va uning tezlanishi ko'paytmasiga teng (F = ma)."
                ),
                Question(
                    id = 102,
                    text = "Erkin tushish tezlanishi g yer sirtida taqriban qancha?",
                    options = listOf("8.31 m/s²", "9.81 m/s²", "100 m/s²", "3.14 m/s²"),
                    correctAnswer = 1,
                    explanation = "O'rtacha erkin tushish tezlanishi g ≈ 9.81 m/s²."
                ),
                Question(
                    id = 103,
                    text = "Om qonuni zanjirning bir qismi uchun qaysi munosabatni ifodalaydi?",
                    options = listOf("I = U / R", "U = I^2 * R", "R = U * I", "P = U / I"),
                    correctAnswer = 0,
                    explanation = "Zanjirdagi tok kuchi kuchlanishga to'g'ri, qarshilikka teskari mutanosib: I = U / R."
                ),
                Question(
                    id = 104,
                    text = "Kinetik energiya qaysi formula bilan hisoblanadi?",
                    options = listOf("mgh", "(m * v^2) / 2", "kx^2 / 2", "F * s"),
                    correctAnswer = 1,
                    explanation = "E_k = (m * v^2) / 2."
                )
            )
        ),
        Subject(
            id = "programming",
            name = "Dasturlash & IT",
            iconName = "Code",
            description = "Algoritmlar, OOP tamoyillari, Kotlin va Python sintaksisi",
            questionsCount = 4,
            questions = listOf(
                Question(
                    id = 201,
                    text = "Kotlin dasturlash tilida o'zgarmas (read-only) o'zgaruvchi qanday e'lon qilinadi?",
                    options = listOf("var", "val", "const", "let"),
                    correctAnswer = 1,
                    explanation = "Kotlinda val - o'zgarmas (immutable), var esa o'zgaruvchan (mutable) qiymat."
                ),
                Question(
                    id = 202,
                    text = "Binary Search algoritmining vaqt bo'yicha murakkabligi (Big-O) qanday?",
                    options = listOf("O(n)", "O(n^2)", "O(log n)", "O(1)"),
                    correctAnswer = 2,
                    explanation = "Ikkilik qidiruv saralangan ro'yxatda har qadamda oraliqni 2 barobar qisqartiradi: O(log n)."
                ),
                Question(
                    id = 203,
                    text = "Ob'ektga yo'naltirilgan dasturlashning asosiy 4 ustuni qaysilar?",
                    options = listOf(
                        "Enkapsulyatsiya, Merosxo'rlik, Polimorfizm, Abstratsiya",
                        "Loop, Array, Function, Variable",
                        "Frontend, Backend, Database, DevOps",
                        "HTML, CSS, JavaScript, SQL"
                    ),
                    correctAnswer = 0,
                    explanation = "OOP ning 4 ustuni: Encapsulation, Inheritance, Polymorphism, Abstraction."
                ),
                Question(
                    id = 204,
                    text = "Git da o'zgarishlarni mahalliy repozitoriyga saqlash buyrug'i nima?",
                    options = listOf("git push", "git commit", "git pull", "git clone"),
                    correctAnswer = 1,
                    explanation = "git commit -m 'xabar' o'zgarishlarni snapshot sifatida saqlaydi."
                )
            )
        ),
        Subject(
            id = "english",
            name = "Ingliz Tili (IELTS)",
            iconName = "Language",
            description = "Grammar, academic vocabulary va reading strategiyalari",
            questionsCount = 4,
            questions = listOf(
                Question(
                    id = 301,
                    text = "Choose the correct sentence in Present Perfect:",
                    options = listOf(
                        "She has finished her diploma thesis.",
                        "She finished her thesis tomorrow.",
                        "She is finish her thesis.",
                        "She has finish her thesis."
                    ),
                    correctAnswer = 0,
                    explanation = "Subject + have/has + V3 (past participle)."
                ),
                Question(
                    id = 302,
                    text = "What is a synonym for 'meticulous'?",
                    options = listOf("Careless", "Thorough & careful", "Fast", "Noisy"),
                    correctAnswer = 1,
                    explanation = "Meticulous means showing great attention to detail; very careful and precise."
                ),
                Question(
                    id = 303,
                    text = "If I ____ more time, I would study another foreign language.",
                    options = listOf("have", "had", "will have", "would have"),
                    correctAnswer = 1,
                    explanation = "Second Conditional: If + Past Simple, would + Verb."
                ),
                Question(
                    id = 304,
                    text = "Which word functions as a coordinating conjunction?",
                    options = listOf("Although", "Because", "However", "And"),
                    correctAnswer = 3,
                    explanation = "FANBOYS: For, And, Nor, But, Or, Yet, So."
                )
            )
        )
    )

    val freelanceProjects: List<FreelanceProject> = listOf(
        FreelanceProject(
            id = "fp_1",
            title = "Python Django Backend Dasturchi",
            client = "FinTech Solutions Toshkent",
            budget = "4,500,000 so'm",
            category = "Dasturlash",
            deadline = "10 kun",
            level = "O'rta daraja",
            description = "Talabalar to'lov tizimi uchun REST API yaratish, PostgreSQL bazasini loyihalash va JWT autentifikatsiyani sozlash kerak.",
            verified = true,
            skills = listOf("Python", "Django", "PostgreSQL", "REST API"),
            bidsCount = 6
        ),
        FreelanceProject(
            id = "fp_2",
            title = "O'quv Markazi uchun Mobil UI/UX Dizayni",
            client = "EduStart Academy",
            budget = "2,800,000 so'm",
            category = "Dizayn",
            deadline = "5 kun",
            level = "Boshlang'ich / O'rta",
            description = "Figma dasturida 8 ta asosiy ekran (Login, Kurslar, Video Player, Quiz va Profil) uchun zamonaviy mobil interfeys chizish.",
            verified = true,
            skills = listOf("Figma", "UI/UX", "Mobile Design", "Prototyping"),
            bidsCount = 11
        ),
        FreelanceProject(
            id = "fp_3",
            title = "Iqtisodiyot Bo'yicha Ilmiy Referat va Prezentatsiya",
            client = "Toshkent Davlat Iqtisodiyot Universiteti Talabasi",
            budget = "950,000 so'm",
            category = "Akademik",
            deadline = "3 kun",
            level = "Boshlang'ich",
            description = "'Raqamli iqtisodiyotda kichik biznes samaradorligi' mavzusida 20 sahifalik referat va 15 slaydlik PowerPoint taqdimot tayyorlash.",
            verified = true,
            skills = listOf("Akademik yozuv", "PowerPoint", "Iqtisodiyot", "MS Word"),
            bidsCount = 4
        ),
        FreelanceProject(
            id = "fp_4",
            title = "IT Maqolasini Ingliz Tilidan O'zbek Tiliga Tarjima",
            client = "TechHub Media",
            budget = "1,500,000 so'm",
            category = "Tarjima",
            deadline = "4 kun",
            level = "O'rta daraja",
            description = "Sun'iy intellekt va LLM modellari arxitekturasi bo'yicha 12 betlik texnik ilmiy maqolani sifatli akademik o'zbek tiliga tarjima qilish.",
            verified = true,
            skills = listOf("Ingliz tili", "O'zbek tili", "Texnik tarjima", "AI tushunchalari"),
            bidsCount = 7
        ),
        FreelanceProject(
            id = "fp_5",
            title = "Telegram Bot Integratsiyasi (Kutubxona Tizimi)",
            client = "Smart Library MCHJ",
            budget = "3,200,000 so'm",
            category = "Dasturlash",
            deadline = "7 kun",
            level = "O'rta daraja",
            description = "Kitoblarni qidirish, ijaraga buyurtma berish va eslatma yuboruvchi qulay Telegram bot yaratish. Aiogram yoki python-telegram-bot.",
            verified = true,
            skills = listOf("Python", "Aiogram", "SQLite", "Telegram API"),
            bidsCount = 9
        )
    )

    val studyPlanItems: List<StudyPlanItem> = listOf(
        StudyPlanItem("sp_1", "Matematik analiz: Limitlar va uzluksizlik", "45 daqiqa", true, "Yuqori"),
        StudyPlanItem("sp_2", "Umumiy fizika: Nyuton dinamikasi masalalari", "60 daqiqa", false, "Yuqori"),
        StudyPlanItem("sp_3", "IELTS Academic Vocabulary: 25 ta yangi so'z", "30 daqiqa", true, "O'rta"),
        StudyPlanItem("sp_4", "Dasturlash: Binary Search va QuickSort tatbiqi", "50 daqiqa", false, "Yuqori"),
        StudyPlanItem("sp_5", "Kurs ishi adabiyotlar tahlili", "40 daqiqa", false, "Past")
    )

    val studentBadges: List<StudentBadge> = listOf(
        StudentBadge("b_1", "Tezkor O'quvchi", "10 ta ketma-ket testni muvaffaqiyatli topshirgan", true, "Bolt"),
        StudentBadge("b_2", "Matematik Daho", "Matematikadan 95%+ natija ko'rsatgan", true, "Calculate"),
        StudentBadge("b_3", "Faol Talaba", "14 kunlik uzluksiz o'qish stajiga ega", true, "CheckCircle"),
        StudentBadge("b_4", "Freelance Ustasi", "Birinchi loyihani muvaffaqiyatli topshirgan", true, "Work"),
        StudentBadge("b_5", "AI Innovator", "50 dan ortiq AI konspektlarini yaratgan", false, "AutoAwesome")
    )

    val initialChatMessages: List<ChatMessage> = listOf(
        ChatMessage(
            id = "msg_1",
            isUser = false,
            text = "Salom, hurmatli talaba! Men sizning AI Akademik Murabbiyingizman. Bugun qaysi fan yoki vazifa bo'yicha yordam kerak? Masalan, differensial tenglama, IELTS insho rejasi yoki dasturlash kodini tushunish bo'yicha savol bering.",
            time = "12:00"
        )
    )
}
