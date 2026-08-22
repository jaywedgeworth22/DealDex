package me.grok.dealdex.data

data class DeskKeys(
    val justTcg: String = "",
    val priceCharting: String = "",
    val pokemonTcg: String = "",
) {
    fun any() = justTcg.isNotBlank() || priceCharting.isNotBlank() || pokemonTcg.isNotBlank()
}

data class Finish(
    val id: String,
    val label: String,
    val market: Double?,
    val low: Double?,
    val mid: Double?,
    val high: Double?,
)

data class TcgCard(
    val id: String,
    val name: String,
    val localId: String,
    val setName: String,
    val setId: String,
    val rarity: String?,
    val image: String?,
    val finishes: List<Finish>,
    val cardmarketEur: Double?,
)

data class LiveListing(
    val id: String,
    val marketplace: String,
    val title: String,
    val url: String,
    val price: Double?,
    val shipping: Double,
    val image: String?,
)

data class Appraisal(
    val market: Double?,
    val adjusted: Double?,
    val allIn: Double,
    val spread: Double?,
    val verdict: String,
)

data class ScoredListing(
    val listing: LiveListing,
    val card: TcgCard?,
    val appraisal: Appraisal?,
    val grade: String,
) {
    val id: String get() = listing.id
}

data class AlertRule(
    val id: String,
    val name: String,
    val enabled: Boolean = true,
    val verdicts: List<String> = listOf("steal", "good"),
    val maxPrice: Double? = 100.0,
    val minSpread: Double? = 0.15,
    val keyword: String = "",
)

data class SavedAppraisal(
    val id: String = java.util.UUID.randomUUID().toString(),
    val cardId: String,
    val cardName: String,
    val setName: String,
    val localId: String,
    val marketplace: String,
    val listingTitle: String,
    val listingPrice: Double,
    val marketPrice: Double?,
    val spread: Double?,
    val verdict: String,
    val condition: String = "NM",
    val grade: String = "raw",
    val status: String = "watching",
    val createdAt: Long = System.currentTimeMillis(),
)
