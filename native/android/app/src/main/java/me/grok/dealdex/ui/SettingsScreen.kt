package me.grok.dealdex.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp

@Composable
fun SettingsScreen(vm: DeskViewModel, state: DeskState) {
    val ctx = LocalContext.current
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
    ) {
        Text("SETTINGS", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text("This Phone", style = MaterialTheme.typography.headlineMedium)
        Text(
            "Website is https://dealdex.net by default.  Leave it unless you are on a preview host.  Sign in with Google, Apple, or X to back up keys.  Keys stay on this phone.  Scan works signed out.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 8.dp),
        )

        Spacer(Modifier.height(20.dp))
        Text("Account", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(
            state.origin,
            vm::setOrigin,
            label = { Text("Website") },
            placeholder = { Text("https://dealdex.net") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Spacer(Modifier.height(12.dp))
        if (state.accountEmail.isNotBlank()) {
            Text("Signed in as ${state.accountEmail}", style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.height(8.dp))
            Button(onClick = { vm.pullKeys() }, enabled = !state.accountBusy) { Text("Pull Keys from Account") }
            Spacer(Modifier.height(8.dp))
            OutlinedButton(onClick = { vm.pushKeys() }, enabled = !state.accountBusy) { Text("Push Phone Keys to Account") }
            Spacer(Modifier.height(8.dp))
            OutlinedButton(onClick = { vm.signOut() }) { Text("Sign Out") }
        } else {
            Button(onClick = { vm.startOAuth(ctx, "google") }, enabled = !state.accountBusy, modifier = Modifier.fillMaxWidth()) {
                Text("Sign in with Google")
            }
            Spacer(Modifier.height(8.dp))
            Button(onClick = { vm.startOAuth(ctx, "apple") }, enabled = !state.accountBusy, modifier = Modifier.fillMaxWidth()) {
                Text("Sign in with Apple")
            }
            Spacer(Modifier.height(8.dp))
            OutlinedButton(onClick = { vm.startOAuth(ctx, "twitter") }, enabled = !state.accountBusy, modifier = Modifier.fillMaxWidth()) {
                Text("Sign in with X")
            }
        }
        if (state.accountNote != null) {
            Text(state.accountNote, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 8.dp))
        }

        Spacer(Modifier.height(24.dp))
        Text("API Desks", style = MaterialTheme.typography.titleMedium)
        Text(
            "Paid desks stay off until you paste a key. DealDex talks to them from this phone.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 4.dp, bottom = 8.dp),
        )
        OutlinedTextField(state.justTcg, vm::setJustTcg, label = { Text("JustTCG Key") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(state.priceCharting, vm::setPriceCharting, label = { Text("PriceCharting Token") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(state.pokemonTcg, vm::setPokemonTcg, label = { Text("Pokémon TCG API Key") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
        Spacer(Modifier.height(16.dp))
        Button(onClick = { vm.saveKeys() }) { Text("Save on This Phone") }
        if (state.settingsNote != null) {
            Text(state.settingsNote, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 8.dp))
        }
    }
}
