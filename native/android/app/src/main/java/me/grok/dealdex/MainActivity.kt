package me.grok.dealdex

import android.Manifest
import android.content.Intent
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Notifications
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
import me.grok.dealdex.ui.AlertsScreen
import me.grok.dealdex.ui.DeskViewModel
import me.grok.dealdex.ui.ScanScreen
import me.grok.dealdex.ui.SettingsScreen
import me.grok.dealdex.ui.DealDexTheme

import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.Tune
import me.grok.dealdex.ui.CardDossierScreen
import me.grok.dealdex.ui.EvaluatorScreen
import me.grok.dealdex.ui.SavedScreen

class MainActivity : ComponentActivity() {
    private val vm: DeskViewModel by viewModels()
    private val askNotify = registerForActivityResult(ActivityResultContracts.RequestPermission()) {}

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT >= 33) askNotify.launch(Manifest.permission.POST_NOTIFICATIONS)
        handleAuth(intent)
        setContent {
            DealDexTheme {
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
                                selected = route == "evaluator",
                                onClick = { nav.navigate("evaluator") { launchSingleTop = true } },
                                icon = { Icon(Icons.Outlined.Tune, contentDescription = null) },
                                label = { Text("Evaluator") },
                            )
                            NavigationBarItem(
                                selected = route == "saved",
                                onClick = { nav.navigate("saved") { launchSingleTop = true } },
                                icon = { Icon(Icons.Outlined.BookmarkBorder, contentDescription = null) },
                                label = { Text("Saved") },
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
                                label = { Text("Settings") },
                            )
                        }
                    },
                ) { pad ->
                    NavHost(nav, startDestination = "scan", modifier = Modifier.padding(pad)) {
                        composable("scan") {
                            ScanScreen(
                                vm,
                                state,
                                onOpenDossier = { card ->
                                    vm.openDossier(card)
                                    nav.navigate("dossier")
                                },
                            )
                        }
                        composable("evaluator") { EvaluatorScreen(vm, state.evaluatorCard) }
                        composable("saved") { SavedScreen(vm, state) }
                        composable("dossier") {
                            val card = state.activeDossierCard
                            if (card != null) {
                                CardDossierScreen(
                                    card = card,
                                    onBack = { nav.popBackStack() },
                                    onOpenEvaluator = { c: me.grok.dealdex.data.TcgCard ->
                                        vm.openEvaluator(c)
                                        nav.navigate("evaluator")
                                    },
                                )
                            }
                        }
                        composable("alerts") { AlertsScreen(vm, state) }
                        composable("settings") { SettingsScreen(vm, state) }
                    }
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleAuth(intent)
    }

    private fun handleAuth(intent: Intent?) {
        val data = intent?.data ?: return
        if (data.scheme == "dealdex") vm.completeOAuth(data)
    }
}
