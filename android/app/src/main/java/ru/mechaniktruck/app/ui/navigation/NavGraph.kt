package ru.mechaniktruck.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import ru.mechaniktruck.app.MechanikApp
import ru.mechaniktruck.app.ui.screens.drivers.DriversScreen
import ru.mechaniktruck.app.ui.screens.fleet.FleetScreen
import ru.mechaniktruck.app.ui.screens.home.HomeScreen
import ru.mechaniktruck.app.ui.screens.login.LoginScreen
import ru.mechaniktruck.app.ui.screens.maintenance.MaintenanceScreen
import ru.mechaniktruck.app.ui.screens.settings.SettingsScreen

@Composable
fun NavGraph(
    navController: NavHostController,
    app: MechanikApp,
) {
    val isLoggedIn by app.authRepository.isLoggedIn.collectAsState(
        initial = app.preferencesManager.getTokenBlocking().isNotBlank(),
    )
    val startDestination = if (isLoggedIn) Routes.HOME else Routes.LOGIN

    NavHost(
        navController = navController,
        startDestination = startDestination,
    ) {
        composable(Routes.LOGIN) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
            )
        }

        composable(Routes.HOME) {
            HomeScreen(
                onNavigateFleet = { navController.navigate(Routes.FLEET) },
                onNavigateMaintenance = { navController.navigate(Routes.MAINTENANCE) },
                onNavigateDrivers = { navController.navigate(Routes.DRIVERS) },
                onNavigateSettings = { navController.navigate(Routes.SETTINGS) },
                onLogout = {
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(Routes.HOME) { inclusive = true }
                    }
                },
            )
        }

        composable(Routes.FLEET) {
            FleetScreen(onBack = { navController.popBackStack() })
        }

        composable(Routes.MAINTENANCE) {
            MaintenanceScreen(onBack = { navController.popBackStack() })
        }

        composable(Routes.DRIVERS) {
            DriversScreen(onBack = { navController.popBackStack() })
        }

        composable(Routes.SETTINGS) {
            SettingsScreen(onBack = { navController.popBackStack() })
        }
    }
}
