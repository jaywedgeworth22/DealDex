package me.grok.spreaddex.data

import android.content.Context

class Prefs(ctx: Context) {
    private val p = ctx.getSharedPreferences("dealdex", Context.MODE_PRIVATE)

    init {
        if (!p.contains("migrated")) {
            val old = ctx.getSharedPreferences("spreaddex", Context.MODE_PRIVATE)
            val e = p.edit()
            for ((k, v) in old.all) {
                if (!p.contains(k)) {
                    when (v) {
                        is String -> e.putString(k, v)
                    }
                }
            }
            e.putBoolean("migrated", true).apply()
        }
    }

    var justTcg: String
        get() = p.getString("justtcg", "") ?: ""
        set(v) { p.edit().putString("justtcg", v).apply() }
    var priceCharting: String
        get() = p.getString("pricecharting", "") ?: ""
        set(v) { p.edit().putString("pricecharting", v).apply() }
    var pokemonTcg: String
        get() = p.getString("pokemontcg", "") ?: ""
        set(v) { p.edit().putString("pokemontcg", v).apply() }
    var origin: String
        get() = p.getString("origin", "") ?: ""
        set(v) { p.edit().putString("origin", v.trim().trimEnd('/')).apply() }
    var token: String
        get() = p.getString("token", "") ?: ""
        set(v) { p.edit().putString("token", v).apply() }
    var email: String
        get() = p.getString("email", "") ?: ""
        set(v) { p.edit().putString("email", v).apply() }

    fun signedIn() = token.isNotBlank()
}
