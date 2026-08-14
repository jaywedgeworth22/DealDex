package me.grok.dealdex.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import me.grok.dealdex.data.ScoredListing

private val chips = listOf("" to "All Pokémon", "charizard" to "charizard", "umbreon vmax" to "umbreon vmax", "151" to "151")

@Composable
fun ScanScreen(vm: DeskViewModel, state: DeskState) {
    val rows = vm.visible()
    Column(
        Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp),
    ) {
        Text("POKÉMON LISTING DESK", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text("Find the best listings.", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(12.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(
                value = state.query,
                onValueChange = vm::setQuery,
                modifier = Modifier.weight(1f),
                singleLine = true,
                placeholder = { Text("All Pokémon") },
            )
            Spacer(Modifier.width(8.dp))
            Button(onClick = { vm.scan() }, enabled = !state.loading) {
                Text(if (state.query.isBlank()) "Scan" else "Scan")
            }
        }
        Row(Modifier.horizontalScroll(rememberScrollState()).padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            chips.forEach { (q, label) ->
                FilterChip(
                    selected = state.query == q,
                    onClick = { vm.scan(q) },
                    label = { Text(label) },
                )
            }
        }
        Row(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            FilterChip(selected = state.view == "all", onClick = { vm.setView("all") }, label = { Text("All ${state.rows.size}") })
            FilterChip(selected = state.view == "deals", onClick = { vm.setView("deals") }, label = { Text("Deals") })
            FilterChip(selected = state.view == "ebay", onClick = { vm.setView("ebay") }, label = { MarketplaceMark("ebay") })
            FilterChip(selected = state.view == "mercari", onClick = { vm.setView("mercari") }, label = { MarketplaceMark("mercari") })
        }
        Spacer(Modifier.height(12.dp))
        when {
            state.loading -> {
                Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator()
                    Text("Reading eBay and Mercari…", color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(top = 8.dp))
                }
            }
            state.error != null -> Text(state.error, color = DealBad)
            else -> LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(rows, key = { it.listing.marketplace + it.listing.id }) { ListingCard(it) }
            }
        }
    }
}

@Composable
private fun ListingCard(row: ScoredListing) {
    val ctx = LocalContext.current
    val a = row.appraisal
    val color = when (a?.verdict) {
        "steal", "good" -> DealGood
        "high", "avoid" -> DealBad
        else -> DealFair
    }
    Surface(shape = RoundedCornerShape(12.dp), tonalElevation = 1.dp, modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(12.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                MarketplaceMark(row.listing.marketplace)
                if (a != null) Text(a.verdict.uppercase(), color = color, style = MaterialTheme.typography.labelSmall)
            }
            Text(row.listing.title, maxLines = 2, overflow = TextOverflow.Ellipsis, style = MaterialTheme.typography.bodyMedium)
            if (row.card != null) {
                Text("${row.card.name} · ${row.card.setName} #${row.card.localId}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Row(Modifier.padding(top = 6.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Mono("${row.listing.price?.let { "$%.2f".format(it) } ?: "—"} ask")
                Mono("${a?.adjusted?.let { "$%.2f".format(it) } ?: "—"} TCGP")
                if (a?.spread != null) Text("%+.1f%%".format(a.spread * 100), color = color, fontFamily = FontFamily.Monospace)
            }
            TextButton(onClick = {
                ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(row.listing.url)))
            }) { Text("Open listing") }
        }
    }
}

@Composable
private fun Mono(text: String) {
    Text(text, fontFamily = FontFamily.Monospace, style = MaterialTheme.typography.bodySmall)
}

@Composable
fun MarketplaceMark(marketplace: String, modifier: Modifier = Modifier) {
    if (marketplace == "ebay") {
        Row(modifier) {
            Text("e", color = Color(0xFFE53238), fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge)
            Text("b", color = Color(0xFF0064D2), fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge)
            Text("a", color = Color(0xFFF5AF02), fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge)
            Text("y", color = Color(0xFF86B817), fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge)
        }
    } else {
        Text(
            "MERCARI",
            color = Color(0xFF5356EE),
            fontWeight = FontWeight.Bold,
            style = MaterialTheme.typography.labelLarge,
            modifier = modifier,
        )
    }
}
