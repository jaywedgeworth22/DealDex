package me.grok.spreaddex

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material.icons.outlined.TravelExplore
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import me.grok.spreaddex.ui.AccountScreen
import me.grok.spreaddex.ui.AlertsScreen
import me.grok.spreaddex.ui.DeskViewModel
import me.grok.spreaddex.ui.ScanScreen
import me.grok.spreaddex.ui.SettingsScreen
import me.grok.spreaddex.ui.SpreadDexTheme

class MainActivity : ComponentActivity() {
    private val vm: DeskViewModel by viewModels()
    private val askNotify = registerForActivityResult(ActivityResultContracts.RequestPermission()) {}

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT >= 33) askNotify.launch(Manifest.permission.POST_NOTIFICATIONS)
        setContent {
            SpreadDexTheme {
                val nav = rememberNavController()
                val state by vm.state.collectAsState()
                val route = nav.currentBackStackEntryAsState().value?.destination?.route
                Scaffold(
                    bottomBar = {
                        NavigationBar {
                            NavigationBarItem(
                                selected = route == "scan",
                                onClick = { nav.navigate("scan") { launchSingleTop = true } },
                                icon = { Icon(Icons.Outlined.TravelExplore, contentDescription = null) },
                                label = { Text("Scan") },
                            )
                            NavigationBarItem(
                                selected = route == "alerts",
                                onClick = { nav.navigate("alerts") { launchSingleTop = true } },
                                icon = { Icon(Icons.Outlined.Notifications, contentDescription = null) },
                                label = { Text("Alerts") },
                            )
                            NavigationBarItem(
                                selected = route == "settings",
                                onClick = { nav.navigate("settings") { launchSingleTop = true } },
                                icon = { Icon(Icons.Outlined.Settings, contentDescription = null) },
                                label = { Text("Keys") },
                            )
                            NavigationBarItem(
                                selected = route == "account",
                                onClick = { nav.navigate("account") { launchSingleTop = true } },
                                icon = { Icon(Icons.Outlined.Person, contentDescription = null) },
                                label = { Text("Account") },
                            )
                        }
                    },
                ) { pad ->
                    NavHost(nav, startDestination = "scan", modifier = Modifier.padding(pad)) {
                        composable("scan") { ScanScreen(vm, state) }
                        composable("alerts") { AlertsScreen(vm, state) }
                        composable("settings") { SettingsScreen(vm, state) }
                        composable("account") { AccountScreen(vm, state) }
                    }
                }
            }
        }
    }
}
