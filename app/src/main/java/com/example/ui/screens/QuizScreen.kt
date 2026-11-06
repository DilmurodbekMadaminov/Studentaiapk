package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.DataProvider
import com.example.model.Question
import com.example.model.Subject
import com.example.ui.theme.*

@Composable
fun QuizScreen(
    onPointsEarned: (Int) -> Unit = {},
    modifier: Modifier = Modifier
) {
    var selectedSubject by remember { mutableStateOf<Subject?>(null) }
    var currentQuestionIdx by remember { mutableIntStateOf(0) }
    var userAnswers by remember { mutableStateOf<Map<Int, Int>>(emptyMap()) }
    var isSubmitted by remember { mutableStateOf(false) }

    if (selectedSubject == null) {
        // Subject Selector View
        SubjectSelectionView(
            subjects = DataProvider.subjects,
            onSubjectSelected = { subject ->
                selectedSubject = subject
                currentQuestionIdx = 0
                userAnswers = emptyMap()
                isSubmitted = false
            },
            modifier = modifier
        )
    } else {
        val currentSubject = selectedSubject!!
        val questions = currentSubject.questions

        if (!isSubmitted) {
            // Active Quiz View
            val currentQ = questions.getOrNull(currentQuestionIdx) ?: questions[0]
            val selectedOption = userAnswers[currentQuestionIdx]

            ActiveQuizView(
                subjectName = currentSubject.name,
                totalQuestions = questions.size,
                currentIdx = currentQuestionIdx,
                question = currentQ,
                selectedOption = selectedOption,
                onSelectOption = { optionIdx ->
                    userAnswers = userAnswers + (currentQuestionIdx to optionIdx)
                },
                onNext = {
                    if (currentQuestionIdx < questions.size - 1) {
                        currentQuestionIdx++
                    } else {
                        isSubmitted = true
                        // Calculate score
                        val correctCount = questions.indices.count { idx ->
                            userAnswers[idx] == questions[idx].correctAnswer
                        }
                        onPointsEarned(correctCount * 50)
                    }
                },
                onPrev = {
                    if (currentQuestionIdx > 0) {
                        currentQuestionIdx--
                    }
                },
                onCancel = {
                    selectedSubject = null
                },
                modifier = modifier
            )
        } else {
            // Quiz Results View
            val correctCount = questions.indices.count { idx ->
                userAnswers[idx] == questions[idx].correctAnswer
            }

            QuizResultView(
                subjectName = currentSubject.name,
                questions = questions,
                userAnswers = userAnswers,
                correctCount = correctCount,
                onRetry = {
                    currentQuestionIdx = 0
                    userAnswers = emptyMap()
                    isSubmitted = false
                },
                onSelectOtherSubject = {
                    selectedSubject = null
                },
                modifier = modifier
            )
        }
    }
}

@Composable
fun SubjectSelectionView(
    subjects: List<Subject>,
    onSubjectSelected: (Subject) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = "Standart Quiz & Testlar",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900
                )
                Text(
                    text = "O'zingiz qiziqqan fanni tanlang va bilimlaringizni sinovdan o'tkazing.",
                    fontSize = 14.sp,
                    color = Slate400
                )
            }
        }

        items(subjects) { subject ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onSubjectSelected(subject) }
                    .testTag("subject_card_${subject.id}"),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(PrimaryBlueLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = when (subject.iconName) {
                                "Calculate" -> Icons.Default.Calculate
                                "Bolt" -> Icons.Default.Bolt
                                "Code" -> Icons.Default.Code
                                else -> Icons.Default.Language
                            },
                            contentDescription = subject.name,
                            tint = PrimaryBlue,
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = subject.name,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                        Text(
                            text = subject.description,
                            fontSize = 12.sp,
                            color = Slate400,
                            maxLines = 2
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "${subject.questionsCount} ta savol • 15 ball/savol",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = PrimaryBlueDark
                        )
                    }

                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = "Go",
                        tint = Slate400
                    )
                }
            }
        }
    }
}

@Composable
fun ActiveQuizView(
    subjectName: String,
    totalQuestions: Int,
    currentIdx: Int,
    question: Question,
    selectedOption: Int?,
    onSelectOption: (Int) -> Unit,
    onNext: () -> Unit,
    onPrev: () -> Unit,
    onCancel: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            // Header with back button & progress
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onCancel) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate700)
                }

                Text(
                    text = subjectName,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )

                Surface(
                    shape = CircleShape,
                    color = PrimaryBlueLight
                ) {
                    Text(
                        text = "${currentIdx + 1} / $totalQuestions",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryBlueDark,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }
            }

            // Linear Progress Indicator
            LinearProgressIndicator(
                progress = { (currentIdx + 1).toFloat() / totalQuestions.toFloat() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(CircleShape),
                color = PrimaryBlue,
                trackColor = Slate200
            )

            // Question Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("quiz_question_card"),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Slate950),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "SAVOL ${currentIdx + 1}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = PrimaryBlue,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = question.text,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        lineHeight = 26.sp
                    )
                }
            }

            // Options list
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                question.options.forEachIndexed { idx, optionText ->
                    val isSelected = selectedOption == idx

                    val borderColor = if (isSelected) PrimaryBlue else Slate200
                    val bgColor = if (isSelected) PrimaryBlueLight else Color.White

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelectOption(idx) }
                            .border(
                                width = if (isSelected) 2.dp else 1.dp,
                                color = borderColor,
                                shape = RoundedCornerShape(16.dp)
                            )
                            .testTag("option_${idx}"),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = bgColor)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(CircleShape)
                                    .background(if (isSelected) PrimaryBlue else Slate100),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = ('A' + idx).toString(),
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSelected) Color.White else Slate700
                                )
                            }

                            Text(
                                text = optionText,
                                fontSize = 15.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = Slate900,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
            }
        }

        // Bottom Navigation Buttons
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (currentIdx > 0) {
                OutlinedButton(
                    onClick = onPrev,
                    modifier = Modifier
                        .weight(1f)
                        .height(52.dp),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Text("Oldingi", fontWeight = FontWeight.Bold)
                }
            }

            Button(
                onClick = onNext,
                modifier = Modifier
                    .weight(if (currentIdx > 0) 1.5f else 1f)
                    .height(52.dp)
                    .testTag("btn_next_question"),
                enabled = selectedOption != null,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text(
                    text = if (currentIdx == totalQuestions - 1) "Natijani Ko'rish" else "Keyingisi",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            }
        }
    }
}

@Composable
fun QuizResultView(
    subjectName: String,
    questions: List<Question>,
    userAnswers: Map<Int, Int>,
    correctCount: Int,
    onRetry: () -> Unit,
    onSelectOtherSubject: () -> Unit,
    modifier: Modifier = Modifier
) {
    val total = questions.size
    val percentage = ((correctCount.toFloat() / total.toFloat()) * 100).toInt()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Slate950)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .clip(CircleShape)
                            .background(if (percentage >= 70) SecondaryGreen.copy(alpha = 0.2f) else ErrorRed.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (percentage >= 70) Icons.Default.CheckCircle else Icons.Default.Warning,
                            contentDescription = null,
                            tint = if (percentage >= 70) SecondaryGreen else ErrorRed,
                            modifier = Modifier.size(40.dp)
                        )
                    }

                    Text(
                        text = if (percentage >= 70) "Ajoyib Natija!" else "Yaxshi Harakat!",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )

                    Text(
                        text = "$subjectName bo'yicha testingiz yakunlandi",
                        fontSize = 13.sp,
                        color = Slate400
                    )

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(24.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(top = 8.dp)
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(text = "$correctCount / $total", fontSize = 22.sp, fontWeight = FontWeight.Black, color = Color.White)
                            Text(text = "To'g'ri javob", fontSize = 11.sp, color = Slate400)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(text = "$percentage%", fontSize = 22.sp, fontWeight = FontWeight.Black, color = PrimaryBlue)
                            Text(text = "Samaradorlik", fontSize = 11.sp, color = Slate400)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(text = "+${correctCount * 50}", fontSize = 22.sp, fontWeight = FontWeight.Black, color = AccentAmber)
                            Text(text = "XP Ballar", fontSize = 11.sp, color = Slate400)
                        }
                    }
                }
            }
        }

        item {
            Text(
                text = "Savollar Tahlili",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )
        }

        items(questions.indices.toList()) { idx ->
            val q = questions[idx]
            val userAns = userAnswers[idx]
            val isCorrect = userAns == q.correctAnswer

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "${idx + 1}-savol",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate500
                        )
                        Surface(
                            shape = CircleShape,
                            color = if (isCorrect) Color(0xFFE6F8F0) else Color(0xFFFDE8E8)
                        ) {
                            Text(
                                text = if (isCorrect) "To'g'ri" else "Noto'g'ri",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isCorrect) SecondaryGreen else ErrorRed,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                            )
                        }
                    }

                    Text(
                        text = q.text,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Slate900
                    )

                    val correctText = q.options.getOrNull(q.correctAnswer) ?: ""
                    Text(
                        text = "To'g'ri javob: $correctText",
                        fontSize = 12.sp,
                        color = SecondaryGreen,
                        fontWeight = FontWeight.Medium
                    )

                    if (q.explanation.isNotEmpty()) {
                        Text(
                            text = "Izoh: ${q.explanation}",
                            fontSize = 12.sp,
                            color = Slate500,
                            lineHeight = 16.sp
                        )
                    }
                }
            }
        }

        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = onSelectOtherSubject,
                    modifier = Modifier
                        .weight(1f)
                        .height(50.dp),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Text("Boshqa Fan", fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = onRetry,
                    modifier = Modifier
                        .weight(1f)
                        .height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Text("Qayta Topshirish", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
