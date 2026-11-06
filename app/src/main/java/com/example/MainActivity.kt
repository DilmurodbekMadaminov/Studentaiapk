package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import com.example.model.AppScreen
import com.example.model.User
import com.example.ui.screens.*
import com.example.ui.theme.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            StudentAITheme {
                MainApp()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainApp() {
    var currentScreen by remember { mutableStateOf(AppScreen.HOME) }
    var user by remember { mutableStateOf(DataProvider.sampleUser) }

    BackHandler(enabled = currentScreen != AppScreen.HOME) {
        currentScreen = AppScreen.HOME
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = if (currentScreen == AppScreen.HOME) "Student AI" else currentScreen.label,
                            fontWeight = FontWeight.Black,
                            fontSize = 20.sp,
                            color = Slate900
                        )
                    }
                },
                navigationIcon = {
                    if (currentScreen != AppScreen.HOME) {
                        IconButton(onClick = { currentScreen = AppScreen.HOME }) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back",
                                tint = Slate900
                            )
                        }
                    }
                },
                actions = {
                    // XP Chip
                    Surface(
                        shape = CircleShape,
                        color = PrimaryBlueLight,
                        modifier = Modifier.clickable { currentScreen = AppScreen.PROGRESS }
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Bolt,
                                contentDescription = "XP",
                                tint = PrimaryBlue,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "${user.xpPoints} XP",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = PrimaryBlueDark
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    // Profile Avatar
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(PrimaryBlue)
                            .clickable { currentScreen = AppScreen.PROFILE },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = user.name.firstOrNull()?.toString() ?: "T",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = Slate900
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color.White,
                tonalElevation = 8.dp,
                modifier = Modifier.testTag("main_bottom_nav")
            ) {
                val navItems = listOf(
                    Triple(AppScreen.HOME, "Asosiy", Icons.Default.Home),
                    Triple(AppScreen.QUIZ, "Testlar", Icons.Default.Calculate),
                    Triple(AppScreen.COACH, "Murabbiy", Icons.Default.Psychology),
                    Triple(AppScreen.FREELANCE, "Freelance", Icons.Default.Work),
                    Triple(AppScreen.CHAT, "Chat", Icons.Default.ChatBubble)
                )

                navItems.forEach { (screen, label, icon) ->
                    val isSelected = currentScreen == screen
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { currentScreen = screen },
                        icon = {
                            Icon(
                                imageVector = icon,
                                contentDescription = label
                            )
                        },
                        label = {
                            Text(
                                text = label,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = PrimaryBlue,
                            selectedTextColor = PrimaryBlue,
                            unselectedIconColor = Slate400,
                            unselectedTextColor = Slate400,
                            indicatorColor = PrimaryBlueLight
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            color = BgLight
        ) {
            when (currentScreen) {
                AppScreen.HOME -> HomeScreen(
                    user = user,
                    onNavigate = { currentScreen = it }
                )
                AppScreen.QUIZ -> QuizScreen(
                    onPointsEarned = { earnedXP ->
                        user = user.copy(
                            xpPoints = user.xpPoints + earnedXP,
                            balance = user.balance + (earnedXP * 100)
                        )
                    }
                )
                AppScreen.COACH -> StudyCoachScreen()
                AppScreen.NOTES -> NotesGeneratorScreen()
                AppScreen.FREELANCE -> FreelanceHubScreen(
                    userBalance = user.balance
                )
                AppScreen.PROGRESS -> ProgressScreen(
                    user = user
                )
                AppScreen.CHAT -> ChatScreen()
                AppScreen.PROFILE -> ProfileScreen(
                    user = user
                )
            }
        }
    }
}
