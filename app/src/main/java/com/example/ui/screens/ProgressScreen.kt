package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.DataProvider
import com.example.model.StudentBadge
import com.example.model.User
import com.example.ui.theme.*

@Composable
fun ProgressScreen(
    user: User,
    modifier: Modifier = Modifier
) {
    val badges = DataProvider.studentBadges

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "Bilim Xaritasi & Reyting",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900
                )
                Text(
                    text = "O'zlashtirish darajangiz, nishonlar va fanni chuqur o'rganish statistikasi.",
                    fontSize = 13.sp,
                    color = Slate400
                )
            }
        }

        // Level & XP Hero Card
        item {
            Card(
                shape = RoundedCornerShape(26.dp),
                colors = CardDefaults.cardColors(containerColor = Slate950),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("progress_hero_card")
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            brush = Brush.radialGradient(
                                colors = listOf(Color(0xFF1E293B), Slate950),
                                radius = 800f
                            )
                        )
                        .padding(22.dp)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                shape = CircleShape,
                                color = PrimaryBlue.copy(alpha = 0.2f)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                                ) {
                                    Icon(
                                        Icons.Default.WorkspacePremium,
                                        contentDescription = null,
                                        tint = PrimaryBlue,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Text(
                                        text = "PRO TALABA • 3-KURS",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = PrimaryBlue,
                                        letterSpacing = 1.sp
                                    )
                                }
                            }

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    Icons.Default.LocalFireDepartment,
                                    contentDescription = "Streak",
                                    tint = AccentAmber,
                                    modifier = Modifier.size(20.dp)
                                )
                                Text(
                                    text = "${user.streakDays} kun",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color.White
                                )
                            }
                        }

                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "Tajriba (XP)",
                                    fontSize = 13.sp,
                                    color = Slate400
                                )
                                Text(
                                    text = "${user.xpPoints} / 3000 XP",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }

                            LinearProgressIndicator(
                                progress = { (user.xpPoints.toFloat() / 3000f).coerceIn(0f, 1f) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(10.dp)
                                    .clip(CircleShape),
                                color = PrimaryBlue,
                                trackColor = Slate800
                            )
                        }

                        Text(
                            text = "Keyingi darajagacha yana 150 XP qoldi. Testlar topshirish orqali bal to'plang!",
                            fontSize = 12.sp,
                            color = Slate400
                        )
                    }
                }
            }
        }

        // Subject Mastery Progress
        item {
            Card(
                shape = RoundedCornerShape(22.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "Fanlar Bo'yicha O'zlashtirish",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )

                    val masteries = listOf(
                        Triple("Dasturlash & Algoritmlar", 0.95f, PrimaryBlue),
                        Triple("Oliy Matematika", 0.92f, SecondaryGreen),
                        Triple("Ingliz Tili (IELTS)", 0.84f, AccentPurple),
                        Triple("Umumiy Fizika", 0.78f, AccentAmber)
                    )

                    masteries.forEach { (subjectName, score, color) ->
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = subjectName,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Slate800
                                )
                                Text(
                                    text = "${(score * 100).toInt()}%",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = color
                                )
                            }
                            LinearProgressIndicator(
                                progress = { score },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(6.dp)
                                    .clip(CircleShape),
                                color = color,
                                trackColor = Slate100
                            )
                        }
                    }
                }
            }
        }

        // Badges Section
        item {
            Text(
                text = "Erishilgan Nishonlar (Badges)",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )
        }

        items(badges) { badge ->
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (badge.isUnlocked) Color.White else Slate100.copy(alpha = 0.6f)
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = if (badge.isUnlocked) 1.dp else 0.dp),
                modifier = Modifier.fillMaxWidth()
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
                            .size(46.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(
                                if (badge.isUnlocked) PrimaryBlueLight else Slate200
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = when (badge.iconType) {
                                "Bolt" -> Icons.Default.Bolt
                                "Calculate" -> Icons.Default.Calculate
                                "Work" -> Icons.Default.Work
                                else -> Icons.Default.EmojiEvents
                            },
                            contentDescription = badge.title,
                            tint = if (badge.isUnlocked) PrimaryBlue else Slate400,
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = badge.title,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (badge.isUnlocked) Slate900 else Slate500
                        )
                        Text(
                            text = badge.description,
                            fontSize = 12.sp,
                            color = Slate400
                        )
                    }

                    if (badge.isUnlocked) {
                        Icon(
                            Icons.Default.CheckCircle,
                            contentDescription = "Unlocked",
                            tint = SecondaryGreen,
                            modifier = Modifier.size(20.dp)
                        )
                    } else {
                        Icon(
                            Icons.Default.Lock,
                            contentDescription = "Locked",
                            tint = Slate400,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }
}
