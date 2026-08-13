package me.grok.spreaddex.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import me.grok.spreaddex.data.AlertRule

@Composable
fun AlertsScreen(vm: DeskViewModel, state: DeskState) {
    val rule = state.rules.firstOrNull() ?: AlertRule("default", "Steals under \$100")
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("ALERTS", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text("Native deal pings", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(16.dp))
        OutlinedTextField(rule.name, { vm.saveRule(rule.copy(name = it)) }, label = { Text("Name") }, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(rule.keyword, { vm.saveRule(rule.copy(keyword = it)) }, label = { Text("Keyword (blank = all Pokémon)") }, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(
            (rule.maxPrice ?: 0.0).let { if (it == 0.0) "" else it.toInt().toString() },
            { vm.saveRule(rule.copy(maxPrice = it.toDoubleOrNull())) },
            label = { Text("Max ask") },
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(
            rule.minSpread?.let { (it * 100).toInt().toString() } ?: "",
            { vm.saveRule(rule.copy(minSpread = it.toDoubleOrNull()?.div(100.0))) },
            label = { Text("Min spread %") },
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(12.dp))
        Switch(checked = rule.enabled, onCheckedChange = { vm.saveRule(rule.copy(enabled = it)) })
        Text(if (rule.enabled) "Alerts on" else "Alerts off", style = MaterialTheme.typography.bodyMedium)
        Spacer(Modifier.height(16.dp))
        Button(onClick = { vm.scan() }) { Text("Scan now and notify") }
        Text(
            "Uses Android notification channels — not a website. Matches fire after each scan.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 12.dp),
        )
    }
}
