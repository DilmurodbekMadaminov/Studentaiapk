package com.example.model

enum class AppScreen(val label: String) {
    HOME("Asosiy"),
    QUIZ("Quiz & Test"),
    COACH("AI Murabbiy"),
    NOTES("Konspekt"),
    FREELANCE("Freelance"),
    PROGRESS("Xarita"),
    CHAT("AI Chat"),
    PROFILE("Profil")
}

data class User(
    val id: String = "std_001",
    val name: String = "Talaba",
    val email: String = "talaba@talabaai.uz",
    val studentId: String = "TI-2024-8841",
    val university: String = "Toshkent Axborot Texnologiyalari Universiteti",
    val faculty: String = "Dasturiy Injiniring",
    val course: Int = 3,
    val balance: Long = 250_000,
    val isPro: Boolean = true,
    val xpPoints: Int = 1450,
    val streakDays: Int = 14,
    val language: String = "uz"
)

data class Question(
    val id: Int,
    val text: String,
    val options: List<String>,
    val correctAnswer: Int,
    val explanation: String = ""
)

data class Subject(
    val id: String,
    val name: String,
    val iconName: String,
    val description: String,
    val questionsCount: Int,
    val questions: List<Question>
)

data class FreelanceProject(
    val id: String,
    val title: String,
    val client: String,
    val budget: String,
    val category: String,
    val deadline: String,
    val level: String,
    val description: String,
    val verified: Boolean = true,
    val skills: List<String> = emptyList(),
    val bidsCount: Int = 0
)

data class FreelanceBid(
    val id: String,
    val projectId: String,
    val projectTitle: String,
    val amount: String,
    val days: String,
    val proposal: String,
    val timestamp: String = "Hozirgina"
)

data class ChatMessage(
    val id: String,
    val isUser: Boolean,
    val text: String,
    val time: String
)

data class StudyPlanItem(
    val id: String,
    val title: String,
    val duration: String,
    val isCompleted: Boolean,
    val priority: String = "O'rta"
)

data class GeneratedNote(
    val id: String,
    val title: String,
    val subject: String,
    val summary: String,
    val keyConcepts: List<String>,
    val formulas: List<String>,
    val reviewQuestions: List<String>
)

data class StudentBadge(
    val id: String,
    val title: String,
    val description: String,
    val isUnlocked: Boolean,
    val iconType: String
)
