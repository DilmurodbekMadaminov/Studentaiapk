package com.example.ui.screens

import androidx.compose.foundation.background
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
import com.example.model.StudyPlanItem
import com.example.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun StudyCoachScreen(
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("O'quv Rejasi", "Pomodoro", "AI Maslahat", "Tahlil")

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top Header
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(
                text = "AI Murabbiy & Mentor",
                fontSize = 24.sp,
                fontWeight = FontWeight.Black,
                color = Slate900
            )
            Text(
                text = "Akademik reja, diqqatni jamlash taymeri va shaxsiy tavsiyalar.",
                fontSize = 13.sp,
                color = Slate400
            )
        }

        // Tab Navigation
        ScrollableTabRow(
            selectedTabIndex = selectedTab,
            edgePadding = 0.dp,
            containerColor = Color.Transparent,
            divider = {},
            indicator = {}
        ) {
            tabs.forEachIndexed { index, title ->
                val isSelected = selectedTab == index
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = if (isSelected) PrimaryBlue else Slate100,
                    modifier = Modifier
                        .padding(end = 8.dp)
                        .clickable { selectedTab = index }
                ) {
                    Text(
                        text = title,
                        fontSize = 13.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) Color.White else Slate700,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                    )
                }
            }
        }

        // Tab Contents
        when (selectedTab) {
            0 -> StudyPlanTab()
            1 -> PomodoroTab()
            2 -> CoachAdviceTab()
            3 -> AnalyticsTab()
        }
    }
}

@Composable
fun StudyPlanTab() {
    var items by remember { mutableStateOf(DataProvider.studyPlanItems) }
    var newTaskText by remember { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = Slate950),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "Bugungi O'quv Maqsadi",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = "Yakunlangan vazifalar: ${items.count { it.isCompleted }} / ${items.size}",
                        fontSize = 13.sp,
                        color = Slate400
                    )
                    LinearProgressIndicator(
                        progress = { if (items.isEmpty()) 0f else items.count { it.isCompleted }.toFloat() / items.size.toFloat() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(CircleShape),
                        color = SecondaryGreen,
                        trackColor = Slate800
                    )
                }
            }
        }

        // Add task input
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = newTaskText,
                    onValueChange = { newTaskText = it },
                    placeholder = { Text("Yangi vazifa kiriting...", fontSize = 13.sp) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(14.dp),
                    singleLine = true
                )
                Button(
                    onClick = {
                        if (newTaskText.isNotBlank()) {
                            val newItem = StudyPlanItem(
                                id = "sp_${System.currentTimeMillis()}",
                                title = newTaskText.trim(),
                                duration = "30 daqiqa",
                                isCompleted = false,
                                priority = "O'rta"
                            )
                            items = items + newItem
                            newTaskText = ""
                        }
                    },
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add")
                }
            }
        }

        items(items) { item ->
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Checkbox(
                        checked = item.isCompleted,
                        onCheckedChange = { isChecked ->
                            items = items.map {
                                if (it.id == item.id) it.copy(isCompleted = isChecked) else it
                            }
                        },
                        colors = CheckboxDefaults.colors(checkedColor = SecondaryGreen)
                    )

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = item.title,
                            fontSize = 14.sp,
                            fontWeight = if (item.isCompleted) FontWeight.Normal else FontWeight.SemiBold,
                            color = if (item.isCompleted) Slate400 else Slate900
                        )
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "⏱ ${item.duration}",
                                fontSize = 11.sp,
                                color = Slate500
                            )
                            Surface(
                                shape = CircleShape,
                                color = if (item.priority == "Yuqori") Color(0xFFFDE8E8) else PrimaryBlueLight
                            ) {
                                Text(
                                    text = item.priority,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (item.priority == "Yuqori") ErrorRed else PrimaryBlueDark,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PomodoroTab() {
    var timeLeftSeconds by remember { mutableIntStateOf(25 * 60) }
    var isRunning by remember { mutableStateOf(false) }
    var sessionsCompleted by remember { mutableIntStateOf(3) }

    LaunchedEffect(isRunning) {
        while (isRunning && timeLeftSeconds > 0) {
            delay(1000L)
            timeLeftSeconds--
            if (timeLeftSeconds == 0) {
                isRunning = false
                sessionsCompleted++
                timeLeftSeconds = 25 * 60
            }
        }
    }

    val minutes = timeLeftSeconds / 60
    val seconds = timeLeftSeconds % 60
    val timeFormatted = String.format("%02d:%02d", minutes, seconds)

    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        Spacer(modifier = Modifier.height(10.dp))

        // Big Circular Timer Card
        Card(
            shape = RoundedCornerShape(32.dp),
            colors = CardDefaults.cardColors(containerColor = Slate950),
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "DIQQAT REJIMI (FOCUS)",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    color = PrimaryBlue,
                    letterSpacing = 1.5.sp
                )

                Text(
                    text = timeFormatted,
                    fontSize = 58.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White
                )

                Text(
                    text = if (isRunning) "Jarayonda... Telefonni chetga suring" else "Tayyor bo'lgach boshlang",
                    fontSize = 13.sp,
                    color = Slate400
                )

                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.padding(top = 12.dp)
                ) {
                    Button(
                        onClick = { isRunning = !isRunning },
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isRunning) AccentAmber else PrimaryBlue
                        ),
                        modifier = Modifier
                            .width(140.dp)
                            .height(50.dp)
                    ) {
                        Icon(
                            imageVector = if (isRunning) Icons.Default.Pause else Icons.Default.PlayArrow,
                            contentDescription = null
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (isRunning) "Pauza" else "Boshlash",
                            fontWeight = FontWeight.Bold
                        )
                    }

                    OutlinedButton(
                        onClick = {
                            isRunning = false
                            timeLeftSeconds = 25 * 60
                        },
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                        modifier = Modifier.height(50.dp)
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = "Reset")
                    }
                }
            }
        }

        // Interval Presets
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = { isRunning = false; timeLeftSeconds = 25 * 60 },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Slate100, contentColor = Slate900)
            ) {
                Text("25 daqiqa (Dars)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
            Button(
                onClick = { isRunning = false; timeLeftSeconds = 5 * 60 },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Slate100, contentColor = Slate900)
            ) {
                Text("5 daqiqa (Tanaffus)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }

        // Sessions count
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Bugungi Pomodoro Sessiyalari",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Text(
                        text = "Jami 75 daqiqa chuqur diqqat vaqti",
                        fontSize = 12.sp,
                        color = Slate400
                    )
                }
                Surface(
                    shape = CircleShape,
                    color = SecondaryGreen.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = "$sessionsCompleted ta",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Black,
                        color = SecondaryGreen,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun CoachAdviceTab() {
    val advices = listOf(
        Pair("Feynman Texnikasi", "O'rgangan mavzuingizni 10 yoshli bolaga tushuntirgandek sodda so'zlar bilan tushuntirishga harakat qiling. Bu bilimlaringizdagi bo'shliqlarni darhol ochib beradi."),
        Pair("Interval Takrorlash (Spaced Repetition)", "Yangi formulalarni 1-kuni, 3-kuni, 7-kuni va 14-kuni qayta ko'rib chiqing. Bu ma'lumotlarni uzoq muddatli xotiraga mustahkamlaydi."),
        Pair("Faol Eslash (Active Recall)", "Konspektni shunchaki o'qib chiqishdan ko'ra, daftarni yopib, asosiy tezislarni o'z so'zlaringiz bilan yozish xotirani 3 barobar yaxshilaydi."),
        Pair("Pomodoro Tanaffuslari", "25 daqiqalik intensiv darsdan keyin 5 daqiqalik tanaffusda ko'zlarni darchaga qaratib dam bering, ekrandan uzoqlashing.")
    )

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(advices) { (title, desc) ->
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(PrimaryBlueLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.AutoAwesome,
                                contentDescription = null,
                                tint = PrimaryBlue,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                        Text(
                            text = title,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                    }
                    Text(
                        text = desc,
                        fontSize = 13.sp,
                        color = Slate700,
                        lineHeight = 18.sp
                    )
                }
            }
        }
    }
}

@Composable
fun AnalyticsTab() {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Haftalik O'qish Faolligi",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Bottom
                ) {
                    val days = listOf("Du" to 0.7f, "Se" to 0.9f, "Ch" to 0.4f, "Pa" to 0.85f, "Ju" to 1.0f, "Sh" to 0.6f, "Ya" to 0.5f)
                    days.forEach { (day, fraction) ->
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .width(28.dp)
                                    .height((fraction * 100).dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (fraction >= 0.8f) PrimaryBlue else Slate200)
                            )
                            Text(text = day, fontSize = 11.sp, color = Slate500)
                        }
                    }
                }
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier.weight(1f)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Jami O'qish Vaqti", fontSize = 11.sp, color = Slate400)
                    Text(text = "18.5 soat", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Slate900)
                    Text(text = "+2.4 soat o'tgan haftaga nisbatan", fontSize = 10.sp, color = SecondaryGreen)
                }
            }

            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier.weight(1f)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Test Natijasi", fontSize = 11.sp, color = Slate400)
                    Text(text = "88.4%", fontSize = 20.sp, fontWeight = FontWeight.Black, color = PrimaryBlue)
                    Text(text = "Top 5% talabalar darajasi", fontSize = 10.sp, color = Slate500)
                }
            }
        }
    }
}
