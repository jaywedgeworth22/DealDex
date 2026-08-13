package me.grok.spreaddex.data

object Appraise {
    private val skip = Regex(
        """\b(lots?\b|\d+\s+cards\b|bulk|binder|choose your|pick your|etb|booster|code card|proxy|custom\b|plush|hoodie|t-?shirt)\b""",
        RegexOption.IGNORE_CASE,
    )

    fun skipListing(title: String) = skip.containsMatchIn(title)

    fun parseMoney(raw: String?): Double? {
        if (raw.isNullOrBlank()) return null
        val n = raw.replace(",", "").toDoubleOrNull() ?: return null
        return if (n > 0) n else null
    }

    fun significantTokens(query: String): List<String> {
        val generic = setOf("pokemon", "pokémon", "tcg", "card", "cards", "holo", "rare")
        return query.lowercase().replace(Regex("[^a-z0-9\\s]"), " ")
            .split(Regex("\\s+")).filter { it.length > 2 && it !in generic }
    }

    fun titleMatches(title: String, query: String): Boolean {
        val t = significantTokens(query).firstOrNull() ?: return true
        return title.lowercase().contains(t)
    }

    fun detectGrade(text: String): String {
        val t = text.lowercase()
        return when {
            t.contains("psa 10") || t.contains("psa10") -> "PSA 10"
            t.contains("psa 9") -> "PSA 9"
            t.contains("bgs 10") || t.contains("black label") -> "BGS 10"
            t.contains("cgc 10") -> "CGC 10"
            else -> "raw"
        }
    }

    fun detectCondition(text: String): Double {
        val t = text.lowercase()
        return when {
            "dmg" in t || "damaged" in t -> 0.2
            "hp" in t || "heavily" in t -> 0.35
            "mp" in t || "played" in t -> 0.55
            "lp" in t || "lightly" in t -> 0.8
            else -> 1.0
        }
    }

    fun gradeMult(card: TcgCard?, grade: String): Double {
        if (grade == "raw") return 1.0
        val set = "${card?.setId.orEmpty()} ${card?.setName.orEmpty()}".lowercase()
        val vintage = Regex("base1|jungle|fossil|neo|wotc|base set").containsMatchIn(set)
        val chase = Regex("illustration rare|special illustration|alt|hyper rare")
            .containsMatchIn(card?.rarity.orEmpty().lowercase())
        if (grade.contains("10") && !grade.contains("9.5")) {
            return when {
                vintage && card?.rarity.orEmpty().lowercase().contains("holo") -> 8.0
                vintage -> 4.0
                chase -> 2.1
                else -> 1.25
            }
        }
        return when (grade) {
            "PSA 9" -> 1.35
            "BGS 9.5", "CGC 9.5" -> 1.5
            else -> 1.0
        }
    }

    fun pickMarket(card: TcgCard): Double? =
        card.finishes.firstOrNull { it.market != null }?.market

    fun appraise(card: TcgCard, listing: LiveListing, grade: String, extra: Double? = null): Appraisal {
        val seed = listOfNotNull(pickMarket(card), extra)
        val raw = if (seed.isEmpty()) null else seed.average()
        val adjusted = raw?.let { it * detectCondition(listing.title) * gradeMult(card, grade) }
        val allIn = (listing.price ?: 0.0) + listing.shipping
        val spread = if (adjusted != null && adjusted > 0) (adjusted - allIn) / adjusted else null
        val verdict = when {
            spread == null -> "fair"
            spread >= 0.30 -> "steal"
            spread >= 0.12 -> "good"
            spread >= -0.08 -> "fair"
            spread >= -0.30 -> "high"
            else -> "avoid"
        }
        return Appraisal(raw, adjusted, allIn, spread, verdict)
    }

    fun nameQuery(title: String): String {
        val stop = setOf(
            "pokemon", "pokémon", "tcg", "card", "cards", "holo", "rare", "nm", "lp",
            "psa", "bgs", "cgc", "english", "japanese", "raw", "mint",
        )
        val tokens = title.lowercase().replace(Regex("https?://\\S+"), " ")
            .replace(Regex("\\$[0-9,.]+"), " ")
            .replace(Regex("[^a-z0-9'\\s-]"), " ")
            .split(Regex("\\s+"))
            .filter { it.isNotBlank() && it !in stop && !it.all(Char::isDigit) }
        return tokens.take(4).joinToString(" ").ifBlank { "pokemon" }
    }
}
