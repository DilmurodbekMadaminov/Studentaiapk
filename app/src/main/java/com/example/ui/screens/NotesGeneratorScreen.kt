package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.GeneratedNote
import com.example.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun NotesGeneratorScreen(
    modifier: Modifier = Modifier
) {
    var topicInput by remember { mutableStateOf("Matematik Analiz: Limitlar va Aniqmasliklar") }
    var selectedSubject by remember { mutableStateOf("Oliy Matematika") }
    var isGenerating by remember { mutableStateOf(false) }
    var generatedNote by remember {
        mutableStateOf(
            GeneratedNote(
                id = "note_sample",
                title = "Limitlar, Ularning Xossalari va 0/0 Aniqmasliklarni Ochish",
                subject = "Oliy Matematika",
                summary = "Limit matematikaning eng muhim poydevor tushunchalaridan biri bo'lib, funksiyaning ma'lum bir nuqtaga yaqinlashgandagi xatti-harakatini tahlil qiladi.",
                keyConcepts = listOf(
                    "Birinchi ajoyib limit: lim (x -> 0) [sin(x) / x] = 1",
                    "Ikkinchi ajoyib limit: lim (x -> ∞) [1 + 1/x]^x = e ≈ 2.71828",
                    "Aniqmaslik turlari: 0/0, ∞/∞, 0 * ∞, ∞ - ∞, 1^∞, 0^0",
                    "Lopital qoidasi: 0/0 yoki ∞/∞ hollarida surat va maxraj hosilalari orqali limit hisoblanadi"
                ),
                formulas = listOf(
                    "lim [f(x) ± g(x)] = lim f(x) ± lim g(x)",
                    "lim [f(x) * g(x)] = lim f(x) * lim g(x)",
                    "lim [c * f(x)] = c * lim f(x)",
                    "L'Hopital: lim [f(x) / g(x)] = lim [f'(x) / g'(x)]"
                ),
                reviewQuestions = listOf(
                    "1. Birinchi ajoyib limit geometrik qanday isbotlanadi?",
                    "2. Lopital qoidasini qo'llashdan oldin qanday shartlar tekshirilishi lozim?",
                    "3. Uzluksiz funksiya ta'rifi limit yordamida qanday beriladi?"
                )
            )
        )
    }

    val clipboardManager = LocalClipboardManager.current
    val coroutineScope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = Color.Transparent,
        modifier = modifier.fillMaxSize()
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = "AI Konspekt Generatori",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )
                    Text(
                        text = "Istalgan dars mavzusi yoki ma'ruza matnidan tizimli konspekt va formulalar yarating.",
                        fontSize = 13.sp,
                        color = Slate400
                    )
                }
            }

            // Input Card
            item {
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Mavzu yoki Matnni Kiriting",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )

                        OutlinedTextField(
                            value = topicInput,
                            onValueChange = { topicInput = it },
                            placeholder = { Text("Mavzu nomini kiriting...") },
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("notes_topic_input"),
                            shape = RoundedCornerShape(14.dp),
                            maxLines = 3
                        )

                        // Subject chips
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            listOf("Matematika", "Fizika", "Dasturlash", "Tarix").forEach { sub ->
                                val isSelected = selectedSubject.contains(sub)
                                FilterChip(
                                    selected = isSelected,
                                    onClick = { selectedSubject = sub },
                                    label = { Text(sub, fontSize = 12.sp) },
                                    colors = FilterChipDefaults.filterChipColors(
                                        selectedContainerColor = PrimaryBlueLight,
                                        selectedLabelColor = PrimaryBlueDark
                                    )
                                )
                            }
                        }

                        Button(
                            onClick = {
                                isGenerating = true
                                coroutineScope.launch {
                                    delay(1500L) // generate simulation
                                    generatedNote = GeneratedNote(
                                        id = "note_${System.currentTimeMillis()}",
                                        title = topicInput.ifBlank { "Akademik Mavzu" },
                                        subject = selectedSubject,
                                        summary = "$topicInput mavzusi bo'yicha tayyorlangan qisqacha ma'lumotlar to'plami. Asosiy teoremalar va amaliy tatbiqlarni qamrab olgan.",
                                        keyConcepts = listOf(
                                            "Asosiy ta'rif va tushunchalar",
                                            "Amaliy tatbiq va metodlar",
                                            "Uchrashi mumkin bo'lgan tipik xatolar"
                                        ),
                                        formulas = listOf(
                                            "Formulaviy ifoda: f(x) -> y",
                                            "Qoida: A = B + C"
                                        ),
                                        reviewQuestions = listOf(
                                            "1. Ushbu mavzuning asosiy g'oyasi nima?",
                                            "2. Formulani qaysi hollarda qo'llash mumkin?"
                                        )
                                    )
                                    isGenerating = false
                                    snackbarHostState.showSnackbar("Konspekt muvaffaqiyatli yaratildi!")
                                }
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp)
                                .testTag("btn_generate_note"),
                            enabled = !isGenerating && topicInput.isNotBlank(),
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                        ) {
                            if (isGenerating) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    color = Color.White,
                                    strokeWidth = 2.dp
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Text("Konspekt tuzilmoqda...", fontWeight = FontWeight.Bold)
                            } else {
                                Icon(Icons.Default.AutoAwesome, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("AI Konspekt Yaratish", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            // Generated Note View
            item {
                Card(
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Title header & Actions
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Surface(
                                    shape = CircleShape,
                                    color = PrimaryBlueLight
                                ) {
                                    Text(
                                        text = generatedNote.subject.uppercase(),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = PrimaryBlueDark,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = generatedNote.title,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate900,
                                    lineHeight = 24.sp
                                )
                            }

                            IconButton(
                                onClick = {
                                    val fullText = buildString {
                                        appendLine(generatedNote.title)
                                        appendLine("---")
                                        appendLine("QISQACHA MAZMUN:")
                                        appendLine(generatedNote.summary)
                                        appendLine("\nASOSIY FORMULALAR:")
                                        generatedNote.formulas.forEach { appendLine("- $it") }
                                        appendLine("\nTUSHUNCHALAR:")
                                        generatedNote.keyConcepts.forEach { appendLine("• $it") }
                                    }
                                    clipboardManager.setText(AnnotatedString(fullText))
                                    coroutineScope.launch {
                                        snackbarHostState.showSnackbar("Konspekt nusxalandi!")
                                    }
                                }
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ContentCopy,
                                    contentDescription = "Copy",
                                    tint = PrimaryBlue
                                )
                            }
                        }

                        Divider(color = Slate100)

                        // Summary section
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(
                                text = "Qisqacha Mazmun",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate800
                            )
                            Text(
                                text = generatedNote.summary,
                                fontSize = 13.sp,
                                color = Slate700,
                                lineHeight = 20.sp
                            )
                        }

                        // Formulas box
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Slate950),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        Icons.Default.Functions,
                                        contentDescription = null,
                                        tint = PrimaryBlue,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Text(
                                        text = "Asosiy Formulalar & Qoidalar",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }
                                generatedNote.formulas.forEach { formula ->
                                    Text(
                                        text = "• $formula",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Slate200
                                    )
                                }
                            }
                        }

                        // Key Concepts
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(
                                text = "Asosiy Tushunchalar & Teoremalar",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate800
                            )
                            generatedNote.keyConcepts.forEach { concept ->
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(6.dp)
                                            .clip(CircleShape)
                                            .background(SecondaryGreen)
                                            .padding(top = 6.dp)
                                    )
                                    Text(
                                        text = concept,
                                        fontSize = 13.sp,
                                        color = Slate700,
                                        lineHeight = 18.sp
                                    )
                                }
                            }
                        }

                        // Review Questions
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(
                                text = "O'z-o'zini Tekshirish Savollari",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate800
                            )
                            generatedNote.reviewQuestions.forEach { q ->
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = Slate50,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(
                                        text = q,
                                        fontSize = 12.sp,
                                        color = Slate700,
                                        modifier = Modifier.padding(12.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
