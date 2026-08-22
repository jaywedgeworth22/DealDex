package me.grok.dealdex.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import me.grok.dealdex.R
import me.grok.dealdex.data.ScoredListing

@Composable
fun ScanScreen(
    vm: DeskViewModel,
    state: DeskState,
    onOpenDossier: (me.grok.dealdex.data.TcgCard) -> Unit = {},
) {
    val rows = vm.visible()
    val ebayCount = state.rows.count { it.listing.marketplace == "ebay" }
    val mercariCount = state.rows.count { it.listing.marketplace == "mercari" }
    val width = LocalConfiguration.current.screenWidthDp
    val cols = if (width >= 600) 2 else 1
    Column(
        Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp),
    ) {
        Image(
            painter = painterResource(R.drawable.dealdex_wordmark),
            contentDescription = "DealDex",
            modifier = Modifier
                .fillMaxWidth(0.6f)
                .height(38.dp),
            contentScale = ContentScale.Fit,
            alignment = Alignment.CenterStart,
        )
        Text(
            stringResource(R.string.app_subtitle),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 4.dp),
        )
        Spacer(Modifier.height(8.dp))
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
                Text("Scan")
            }
        }
        Row(
            Modifier
                .fillMaxWidth()
                .padding(top = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            MarketplaceSourceToggle(
                marketplace = "ebay",
                selected = "ebay" in state.sources,
                count = ebayCount,
                modifier = Modifier.weight(1f),
            ) { vm.toggleSource("ebay") }
            MarketplaceSourceToggle(
                marketplace = "mercari",
                selected = "mercari" in state.sources,
                count = mercariCount,
                modifier = Modifier.weight(1f),
            ) { vm.toggleSource("mercari") }
        }
        Spacer(Modifier.height(10.dp))
        when {
            state.loading && state.rows.isEmpty() -> {
                Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator()
                    Text("Reading eBay and Mercari…", color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(top = 8.dp))
                }
            }
            state.error != null -> Text(state.error, color = Color.Red)
            else -> LazyVerticalGrid(
                columns = GridCells.Fixed(cols),
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                items(items = rows, key = { it.listing.marketplace + it.listing.id }) { row ->
                    ListingCard(
                        row = row,
                        onOpenDossier = onOpenDossier,
                        onSave = { item -> vm.saveAppraisal(item) },
                    )
                }
            }
        }
    }
}

@Composable
private fun MarketplaceSourceToggle(
    marketplace: String,
    selected: Boolean,
    count: Int,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    val bg = if (selected) Color(0xFF3F4A32) else Color(0xCC1A1B16)
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = bg,
        modifier = modifier
            .height(56.dp)
            .clickable(onClick = onClick),
    ) {
        Row(
            Modifier.fillMaxSize().padding(horizontal = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            MarketplaceMark(marketplace, onDark = true)
            Text(
                "$count",
                color = Color.White,
                style = MaterialTheme.typography.titleSmall,
                fontFamily = FontFamily.Monospace,
            )
        }
    }
}

@Composable
private fun ListingCard(
    row: ScoredListing,
    onOpenDossier: (me.grok.dealdex.data.TcgCard) -> Unit,
    onSave: (me.grok.dealdex.data.SavedAppraisal) -> Unit,
) {
    val ctx = LocalContext.current
    val a = row.appraisal
    val color = when (a?.verdict) {
        "steal", "good" -> DealGood
        "high", "avoid" -> DealBad
        else -> DealFair
    }
    Surface(shape = RoundedCornerShape(12.dp), tonalElevation = 1.dp, modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(12.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                MarketplaceMark(row.listing.marketplace)
                if (a != null) Text(a.verdict.uppercase(), color = color, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                Spacer(Modifier.weight(1f))
                IconButton(onClick = {
                    val card = row.card
                    if (card != null && row.listing.price != null) {
                        val item = me.grok.dealdex.data.SavedAppraisal(
                            cardId = card.id,
                            cardName = card.name,
                            setName = card.setName,
                            localId = card.localId,
                            marketplace = row.listing.marketplace,
                            listingTitle = row.listing.title,
                            listingPrice = row.listing.price,
                            marketPrice = a?.adjusted,
                            spread = a?.spread,
                            verdict = a?.verdict ?: "fair",
                            grade = row.grade,
                        )
                        onSave(item)
                        android.widget.Toast.makeText(ctx, "Saved to Ledger", android.widget.Toast.LENGTH_SHORT).show()
                    }
                }) {
                    Icon(androidx.compose.material.icons.Icons.Default.BookmarkBorder, contentDescription = "Save", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Text(row.listing.title, maxLines = 2, overflow = TextOverflow.Ellipsis, style = MaterialTheme.typography.bodyMedium)
            if (row.card != null) {
                Text("${row.card.name} · ${row.card.setName} #${row.card.localId}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Row(Modifier.padding(top = 6.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Mono("${row.listing.price?.let { "$%.2f".format(it) } ?: "—"} ask")
                Mono("${a?.adjusted?.let { "$%.2f".format(it) } ?: "—"} TCGP")
                if (a?.spread != null) Text("%+.1f%%".format(a.spread * 100), color = color, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold)
            }
            Row(Modifier.padding(top = 4.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (row.card != null) {
                    TextButton(onClick = { onOpenDossier(row.card) }) {
                        Text("Card Dossier")
                    }
                }
                TextButton(onClick = {
                    ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(row.listing.url)))
                }) { Text("Open Listing") }
            }
        }
    }
}

@Composable
private fun Mono(text: String) {
    Text(text, fontFamily = FontFamily.Monospace, style = MaterialTheme.typography.bodySmall)
}

@Composable
fun MarketplaceMark(marketplace: String, modifier: Modifier = Modifier, onDark: Boolean = false) {
    if (marketplace == "ebay") {
        val e = if (onDark) Color.White else Color(0xFFE53238)
        val b = if (onDark) Color.White else Color(0xFF0064D2)
        val a = if (onDark) Color.White else Color(0xFFF5AF02)
        val y = if (onDark) Color.White else Color(0xFF86B817)
        Row(modifier) {
            Text("e", color = e, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge)
            Text("b", color = b, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge)
            Text("a", color = a, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge)
            Text("y", color = y, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge)
        }
    } else {
        Text(
            "MERCARI",
            color = if (onDark) Color.White else Color(0xFF5356EE),
            fontWeight = FontWeight.Bold,
            style = MaterialTheme.typography.labelLarge,
            modifier = modifier,
        )
    }
}
