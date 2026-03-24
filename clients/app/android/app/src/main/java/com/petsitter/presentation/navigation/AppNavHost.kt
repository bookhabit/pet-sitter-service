package com.petsitter.presentation.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.*
import com.petsitter.domain.model.UserRole
import com.petsitter.presentation.auth.*
import com.petsitter.presentation.chat.ChatListScreen
import com.petsitter.presentation.favorites.FavoritesScreen
import com.petsitter.presentation.jobs.JobListScreen
import com.petsitter.presentation.profile.ProfileScreen
import com.petsitter.ui.theme.AppColors

@Composable
fun AppNavHost(
    authViewModel: AuthViewModel = hiltViewModel(),
) {
    val authState by authViewModel.uiState.collectAsStateWithLifecycle()
    val navController = rememberNavController()

    // isHydrated 전에는 빈 화면 (expo-app의 null 반환과 동일)
    if (!authState.isHydrated) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = AppColors.primary)
        }
        return
    }

    // 인증 상태에 따른 startDestination 결정
    val startDestination = if (authState.isLoggedIn) AppRoute.JOB_LIST else AppRoute.LOGIN

    val isPetSitter = authState.user?.role == UserRole.PetSitter

    if (!authState.isLoggedIn) {
        // 비인증 플로우
        // 각 화면이 자체 Scaffold + TopAppBar 로 safe area 를 처리함
        // (TopAppBar → status bar 자동 처리, Scaffold contentWindowInsets → nav bar 처리)
        NavHost(navController = navController, startDestination = AppRoute.LOGIN) {
            composable(AppRoute.LOGIN) {
                LoginScreen(
                    onNavigateToRegister = { navController.navigate(AppRoute.REGISTER) },
                    authViewModel = authViewModel,
                )
            }
            composable(AppRoute.REGISTER) {
                RegisterScreen(
                    onNavigateBack = { navController.popBackStack() },
                    onRegisterSuccess = {
                        navController.navigate(AppRoute.LOGIN) {
                            popUpTo(AppRoute.REGISTER) { inclusive = true }
                        }
                    },
                )
            }
        }
    } else {
        // 인증 후 탭 네비게이션
        MainTabScaffold(
            authViewModel = authViewModel,
            isPetSitter = isPetSitter,
        )
    }
}

@Composable
private fun MainTabScaffold(
    authViewModel: AuthViewModel,
    isPetSitter: Boolean,
) {
    val authState by authViewModel.uiState.collectAsStateWithLifecycle()
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    Scaffold(
        containerColor = AppColors.background,
        bottomBar = {
            NavigationBar(containerColor = AppColors.white) {
                NavigationBarItem(
                    selected = currentRoute == AppRoute.JOB_LIST,
                    onClick = { navController.navigate(AppRoute.JOB_LIST) { launchSingleTop = true } },
                    icon = { Icon(if (currentRoute == AppRoute.JOB_LIST) Icons.Filled.Home else Icons.Outlined.Home, null) },
                    label = { Text("공고") },
                )
                if (isPetSitter) {
                    NavigationBarItem(
                        selected = currentRoute == AppRoute.FAVORITES,
                        onClick = { navController.navigate(AppRoute.FAVORITES) { launchSingleTop = true } },
                        icon = { Icon(if (currentRoute == AppRoute.FAVORITES) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder, null) },
                        label = { Text("즐겨찾기") },
                    )
                }
                NavigationBarItem(
                    selected = currentRoute == AppRoute.CHAT_LIST,
                    onClick = { navController.navigate(AppRoute.CHAT_LIST) { launchSingleTop = true } },
                    icon = { Icon(if (currentRoute == AppRoute.CHAT_LIST) Icons.Filled.MailOutline else Icons.Outlined.MailOutline, null) },
                    label = { Text("채팅") },
                )
                NavigationBarItem(
                    selected = currentRoute == AppRoute.PROFILE,
                    onClick = { navController.navigate(AppRoute.PROFILE) { launchSingleTop = true } },
                    icon = { Icon(if (currentRoute == AppRoute.PROFILE) Icons.Filled.Person else Icons.Outlined.Person, null) },
                    label = { Text("프로필") },
                )
            }
        },
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = AppRoute.JOB_LIST,
            modifier = Modifier.padding(padding),
        ) {
            composable(AppRoute.JOB_LIST)  { JobListScreen() }
            composable(AppRoute.FAVORITES) { FavoritesScreen() }
            composable(AppRoute.CHAT_LIST) { ChatListScreen() }
            composable(AppRoute.PROFILE)   {
                ProfileScreen(
                    user = authState.user,
                    onLogout = { authViewModel.logout() },
                )
            }
        }
    }
}
