package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import com.example.model.FreelanceBid
import com.example.model.FreelanceProject
import com.example.ui.theme.*

@Composable
fun FreelanceHubScreen(
    userBalance: Long,
    modifier: Modifier = Modifier
) {
    var projects by remember { mutableStateOf(DataProvider.freelanceProjects) }
    var userBids by remember { mutableStateOf<List<FreelanceBid>>(emptyList()) }
    var selectedCategory by remember { mutableStateOf("Barchasi") }
    var searchQuery by remember { mutableStateOf("") }
    var selectedProjectForBid by remember { mutableStateOf<FreelanceProject?>(null) }
    val categories = listOf("Barchasi", "Dasturlash", "Dizayn", "Akademik", "Tarjima")

    val filteredProjects = projects.filter { project ->
        val matchesCategory = selectedCategory == "Barchasi" || project.category.equals(selectedCategory, ignoreCase = true)
        val matchesQuery = searchQuery.isBlank() ||
                project.title.contains(searchQuery, ignoreCase = true) ||
                project.description.contains(searchQuery, ignoreCase = true) ||
                project.skills.any { it.contains(searchQuery, ignoreCase = true) }
        matchesCategory && matchesQuery
    }

    Scaffold(
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
            // Header
            item {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = "Talabalar Freelance Hubi",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black,
                        color = Slate900
                    )
                    Text(
                        text = "Bilimlaringiz orqali daromad qiling va portfolio to'plang.",
                        fontSize = 13.sp,
                        color = Slate400
                    )
                }
            }

            // Wallet card
            item {
                Card(
                    shape = RoundedCornerShape(22.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate950),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(
                                text = "TALABA BALANSI",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate400,
                                letterSpacing = 1.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "${String.format("%,d", userBalance)} so'm",
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White
                            )
                            Text(
                                text = "Yuborilgan takliflar: ${userBids.size} ta",
                                fontSize = 12.sp,
                                color = SecondaryGreen
                            )
                        }

                        Surface(
                            shape = CircleShape,
                            color = PrimaryBlue.copy(alpha = 0.2f)
                        ) {
                            Icon(
                                imageVector = Icons.Default.AccountBalanceWallet,
                                contentDescription = "Wallet",
                                tint = PrimaryBlue,
                                modifier = Modifier
                                    .padding(14.dp)
                                    .size(28.dp)
                            )
                        }
                    }
                }
            }

            // Search Bar
            item {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Loyiha yoki ko'nikma bo'yicha qidiruv...", fontSize = 13.sp) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Slate400) },
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("freelance_search_input"),
                    singleLine = true
                )
            }

            // Category Chips
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(categories) { cat ->
                        val isSelected = selectedCategory == cat
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (isSelected) PrimaryBlue else Color.White,
                            border = if (isSelected) null else androidx.compose.foundation.BorderStroke(1.dp, Slate200),
                            modifier = Modifier.clickable { selectedCategory = cat }
                        ) {
                            Text(
                                text = cat,
                                fontSize = 13.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color.White else Slate700,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                            )
                        }
                    }
                }
            }

            // Projects List
            items(filteredProjects) { project ->
                val hasAlreadyBid = userBids.any { it.projectId == project.id }

                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("project_card_${project.id}")
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Title and Budget
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = project.title,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate900
                                )
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Text(
                                        text = project.client,
                                        fontSize = 12.sp,
                                        color = Slate500
                                    )
                                    if (project.verified) {
                                        Icon(
                                            Icons.Default.Verified,
                                            contentDescription = "Verified Client",
                                            tint = PrimaryBlue,
                                            modifier = Modifier.size(14.dp)
                                        )
                                    }
                                }
                            }

                            Text(
                                text = project.budget,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Black,
                                color = SecondaryGreen
                            )
                        }

                        Text(
                            text = project.description,
                            fontSize = 13.sp,
                            color = Slate700,
                            lineHeight = 18.sp
                        )

                        // Skills tags
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            project.skills.take(4).forEach { skill ->
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = Slate100
                                ) {
                                    Text(
                                        text = skill,
                                        fontSize = 11.sp,
                                        color = Slate700,
                                        fontWeight = FontWeight.Medium,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                    )
                                }
                            }
                        }

                        Divider(color = Slate100)

                        // Footer with deadline and action
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "⏳ ${project.deadline}",
                                    fontSize = 12.sp,
                                    color = Slate500
                                )
                                Text(
                                    text = "• ${project.bidsCount + (if (hasAlreadyBid) 1 else 0)} taklif",
                                    fontSize = 12.sp,
                                    color = Slate400
                                )
                            }

                            Button(
                                onClick = { selectedProjectForBid = project },
                                enabled = !hasAlreadyBid,
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (hasAlreadyBid) SecondaryGreen else PrimaryBlue
                                ),
                                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp)
                            ) {
                                Text(
                                    text = if (hasAlreadyBid) "Taklif Yuborildi" else "Taklif Berish",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    // Bid Modal Dialog
    if (selectedProjectForBid != null) {
        val project = selectedProjectForBid!!
        var bidAmount by remember { mutableStateOf(project.budget) }
        var bidDays by remember { mutableStateOf(project.deadline) }
        var proposalText by remember { mutableStateOf("Assalomu alaykum. Ushbu loyihani belgilangan muddatda va sifatli bajarishga tayyorman.") }

        AlertDialog(
            onDismissRequest = { selectedProjectForBid = null },
            shape = RoundedCornerShape(24.dp),
            title = {
                Text(
                    text = "Taklif Yuborish",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = project.title,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 14.sp,
                        color = PrimaryBlue
                    )

                    OutlinedTextField(
                        value = bidAmount,
                        onValueChange = { bidAmount = it },
                        label = { Text("Taklif summasi") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = bidDays,
                        onValueChange = { bidDays = it },
                        label = { Text("Bajarish muddati") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = proposalText,
                        onValueChange = { proposalText = it },
                        label = { Text("Qisqacha izoh / cover letter") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 4
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val newBid = FreelanceBid(
                            id = "bid_${System.currentTimeMillis()}",
                            projectId = project.id,
                            projectTitle = project.title,
                            amount = bidAmount,
                            days = bidDays,
                            proposal = proposalText
                        )
                        userBids = userBids + newBid
                        selectedProjectForBid = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                ) {
                    Text("Tasdiqlash & Yuborish")
                }
            },
            dismissButton = {
                TextButton(onClick = { selectedProjectForBid = null }) {
                    Text("Bekor qilish")
                }
            }
        )
    }
}
